# Feature Inventory

Status describes inspected source, not a deployed Firebase environment. **Partially implemented** means a real path exists but important product behavior/persistence is missing. **UI only** means a control/copy exists without a real backend operation. **Unverified** means the path exists but live service behavior could not be confirmed.

| Feature | Status | Evidence and notes |
| --- | --- | --- |
| Landing page | UI only (navigation works) | `src/features/landing/pages/LandingPage.tsx`; animated marketing page. Countdown, avatars, chat transcript, and social proof are illustrative. “AI-powered” claim has no AI implementation. |
| Email/password auth | Partially implemented; Firebase path present | `src/features/auth/pages/SignUpPage.tsx`, `LoginPage.tsx`, `src/firebase/auth.ts`. Signup creates Auth user/profile docs; login uses Firebase. Password reset link is inert; no email-verification UI. Live provider/config behavior unverified. |
| Google login | Partially implemented; Firebase path present | `src/firebase/auth.ts`, auth pages. Uses popup and ensures profile docs. Live OAuth setup unverified. |
| Anonymous account/session | Not implemented in active flow | `src/services/firebase/auth.ts` exports `signInAnonymously`, but no active caller. Chat anonymity is a UI identity mode after regular auth. |
| Demo login | Mock/demo | Development-only button in `LoginPage.tsx`; tries a fixed Firebase account, then can set a local-storage demo identity that bypasses route guards but lacks Firebase auth. Matching requires an authenticated Firebase user. |
| Onboarding | Partially implemented | `src/features/onboarding/pages/OnboardingPage.tsx`; nickname, interests, language, guideline acknowledgement, and profile writes for Firebase users. Photo action is inert; duplicate auth guard; local demo values are not persisted at completion. |
| Dashboard/vibes | Partially implemented | `src/features/dashboard/pages/DashboardPage.tsx`; profile load, friend/request listeners and actions. Selected vibe is sent in route state but ignored by matching. Recent-friend presence dot is hard-coded. |
| Random matching | Partially implemented; live backend unverified | `src/features/matching/services/matchmaking.service.ts`, `MatchSearchPage.tsx`; queue query, listener, transaction, room creation, timeout. Client-authoritative, no eligibility/expiry/vibe filters or backend function; page timeout is 15 seconds. |
| Anonymous chat/messages | Partially implemented; realtime path present | `src/features/chat/pages/AnonymousChatPage.tsx`, `src/features/chat/services/chat.service.ts`; Firestore message listener, send, typing, timer, request status. Default mock room is not a valid backend room. Timer expiry does not end/delete stored data. |
| Chat-room lifecycle | Partially implemented | Match transaction creates room; explicit Skip sets `status: ended`; timer path only navigates to time-up. Peer status listener redirects when ended. No cleanup or session-expiry backend. |
| Typing indicator | Implemented in UI and Firestore path; live unverified | Anonymous chat writes `typing.{uid}` on chat doc; permanent chat does similarly. Helper component exists but pages render their own versions. |
| Next stranger/disconnect | Partially implemented | ChatHeader Skip ends chat and navigates to dashboard; it does not immediately launch a match. Match cancellation navigates and sets a local abort flag but does not promptly clean up queue/listener. |
| Friend request | Partially implemented; Firestore path present | `chat.service.ts`, `friends.service.ts`, chat page/modal. Request and notifications are created; accept creates friendship. Not atomic, fields are inconsistent, and continue-after-accept does not open permanent chat. |
| Permanent friend chat | Partially implemented; realtime path present | `src/features/chat/pages/PermanentChatPage.tsx`, `permanent-chat.service.ts`; message listener/send, typing, read receipts, summaries and notification updates. Access/data consistency depend on client behavior and current rules. |
| Friends list/profile | Partially implemented | `FriendsListPage.tsx`, `FriendProfilePage.tsx`, `FriendCard.tsx`; listeners, search, online tab, profile joins, block/remove actions. Profile-level block/report controls are inert. |
| Block users | Partially implemented | Friend card writes friendship status `blocked`; blocked-users page lists/unblocks accepted friends. Anonymous chat block only ends current chat; matching does not filter blocked users and rules do not enforce blocks. |
| User reporting | UI only | Chat report action only shows “Report submitted” toast; friend profile has an inert button. No report collection, submission service, or admin/moderation workflow. |
| Online status | Partially implemented | `AuthContext.tsx` writes online at auth state and offline on its logout method. Settings uses direct Firebase signout; no server presence/on-disconnect handling, so status can become stale. Privacy toggles are not honored. |
| Notifications | Partially implemented; Firestore path present | Service, page, Zustand store, badge. Subscribed only on notification page. “All” and “Unread” suppress `new_message`; badge count includes those messages. Some actions navigate/accept requests. |
| Own profile/edit | Partially implemented | `MyProfilePage.tsx`, `EditProfileModal.tsx`; Firestore reads/writes and local demo edits. Some displayed badges/stats are hard-coded/placeholders; avatar selection uses a predefined remote sprite, not upload. |
| Settings/theme | Partially implemented | `SettingsPage.tsx`; theme changes via `next-themes`, navigation and signout. Privacy toggles are ephemeral component state; notification preferences are not implemented. |
| Privacy controls | UI only | `PrivacyPage.tsx`; five toggles are React state and do not persist or affect backend behavior, despite copy claiming local saving. |
| Safety center/guidelines | UI only (static content) | `SafetyCenterPage.tsx`, `GuidelinesPage.tsx`; informational copy. Block/report claims exceed implemented behavior. |
| Help/support | UI only / mock | `HelpSupportPage.tsx`; email link is external, FAQ is static, message submission waits then shows success without sending data. |
| Admin/moderation | Not implemented | No admin routes, role checks, report queue, moderation service, or Functions backend found. |
| Cloud Functions | Not implemented in repository | Callable client wrapper exists but no function source or active callable use. |
| Firebase Storage uploads | Not implemented in active UI | Generic helper exists, but no active upload code or storage rules config found. |
| PWA/offline support | Not implemented / dependency-only | PWA and Workbox packages are declared, but Vite plugin is not configured and no manifest/service worker is present. |

Supporting workflow details are in [APPLICATION_FLOW.md](APPLICATION_FLOW.md). UI claims and safety concerns are in [UI_UX_AUDIT.md](UI_UX_AUDIT.md) and [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
