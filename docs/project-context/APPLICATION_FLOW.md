# Application Flow

## Providers and Routing

`src/main.tsx` mounts `AuthProvider`, `BrowserRouter`, `ThemeProvider`, the route tree, and Sonner's `Toaster`. Route paths:

| Path | Page | Access behavior |
| --- | --- | --- |
| `/` | Landing | Guest-only; authenticated or demo-marked visitors redirect to `/dashboard`. |
| `/login`, `/signup` | Authentication | Guest-only. Successful auth navigates to `/`, which redirects to dashboard. |
| `/onboarding` | Onboarding | Protected by Firebase user or local demo marker. |
| `/dashboard` | Dashboard/vibe selection | Protected. Loads Firestore profile for Firebase users and redirects if onboarding is incomplete. |
| `/match-search` | Match search | Protected; starts queue search immediately. |
| `/chat` | Timed anonymous chat | Protected; expects `chatId` in router state, or falls back to `mock-chat-123`. |
| `/time-up` | End-of-session summary | Protected; uses router state or hard-coded sample defaults on direct entry. |
| `/friends`, `/friends/:friendId` | Friends list/profile | Protected. |
| `/chat/permanent/:chatId` | Permanent conversation | Protected; parameter is normally a friendship document ID. |
| `/profile` | Own profile | Protected. |
| `/settings`, `/settings/blocked-users`, `/settings/privacy`, `/settings/safety`, `/settings/guidelines`, `/settings/help` | Settings/safety/support | Protected. |
| `/notifications` | Notifications | Protected. |

There is no explicit catch-all/404 route. Route guards test a local-storage string as an authentication fallback; they do not validate its contents.

## Main User Journey

1. A guest arrives on the Ryple landing page and can navigate to login/signup. Landing animations, chat transcript, and countdown are demo visuals.
2. Signup uses email/password Firebase Auth and writes `users/{uid}` plus `profiles/{uid}`. Google popup login similarly ensures both documents. No active anonymous-auth entry point is called.
3. New profiles begin with `onboardingCompleted: false`. Dashboard loads the profile and navigates to onboarding. Onboarding collects nickname, interests, language, and guideline consent; for Firebase users it writes nickname/interests/language and completion state to the profile. The optional photo button has no upload action. Demo onboarding does not persist collected values to the local profile.
4. Dashboard lets users select one of nine hard-coded vibe options and navigates to matching with the selected vibe in route state. The match page/service does not read or use it.
5. Match search writes a `searching` queue record, subscribes to it, queries another `searching` record, and attempts a Firestore transaction that creates a chat and marks both queue records matched. The page passes a 15-second failure timeout. This is client-side matchmaking, not Cloud Functions or AI.
6. On success, the page navigates to `/chat` with the chat ID. If absent, the page uses `mock-chat-123`; that placeholder has no authorized chat document, so real sends are not expected to work.
7. Anonymous chat reads chat status/participants/timer and subscribes to message/typing/request updates. Messages are stored at `chats/{chatId}/messages`. The local timer routes to `/time-up`; this path does not mark the Firestore chat ended or delete data. Explicit Skip updates `status: ended` and returns to dashboard.
8. A user can send a friend request. Accepting updates the request and creates a friendship plus notification. Opening that friendship's permanent-chat route initializes `permanent_chats/{friendshipId}` and enables ongoing messages.
9. Permanent chat writes messages, updates chat/friendship summaries, marks received messages read, updates typing state, and attempts to create a notification. Friends and notification pages subscribe to Firestore while mounted.

## Authentication and Session Details

- `AuthContext` subscribes to Firebase auth changes and writes online status/last-seen to both user and profile documents. Its logout attempts offline writes, removes the demo marker, then signs Firebase Auth out.
- Settings logout signs out directly and clears demo/local settings keys; it does not call `AuthContext.logout`, so that offline update path is skipped.
- Dev-only demo login attempts a fixed Firebase account and can fall back to a JSON local-storage identity accepted by route guards. The marker does not establish Firebase auth. Matching requires `auth.currentUser`, so local-only demo users cannot match.
- Anonymous sign-in, password reset, and email-verification helpers exist in the unused generalized Firebase service layer; the current UI does not call them. The login “Forgot?” link is `href="#"`.

## Navigation and Workflow Gaps

- Notification state is subscribed only when `/notifications` is mounted; the global badge can be stale elsewhere. The store counts all unread items but filters `new_message` notifications out of “All” and “Unread”.
- The friend-request modal's continue action only closes the modal; it does not open permanent chat.
- Chat report handlers show a success toast without recording a report. Chat block ends the current chat but does not persist a block relationship.
- Friend-profile Block and Report buttons are not wired. Friend-card block/remove actions do call Firestore services.
- Settings privacy controls only update component state; they are not saved to local storage or Firestore despite copy claiming local saving.
- Help submission waits locally and displays success; it sends no request.

## What Is Not Verified

Build success verifies TypeScript compilation and bundling, not Firebase project enablement, Auth providers, database indexes, production deployment, deployed rules, behavior across two live user accounts, or actual mobile/desktop rendering. No service credentials or remote Firebase access were inspected.
