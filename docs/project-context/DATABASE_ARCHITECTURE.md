# Database Architecture

## Backend Topology

The active client uses Firebase Authentication and Cloud Firestore. Firestore paths are accessed directly from browser code. No custom API server, Cloud Functions source, database migration/index config, or moderation backend is present. Firebase Storage and callable Functions wrappers exist in `src/services/firebase/`, but active product features do not import them. `firebase.json` configures only Firestore rules and Firebase Hosting.

The model is document-oriented, with user IDs linking records. The authoritative-looking collection interfaces are in `src/firebase/collections.ts`; separate generic types in `src/types/` describe a different, mostly unused schema.

## Collections and Observed Data

| Path | Observed shape and use |
| --- | --- |
| `users/{uid}` | Auth/profile mirror. Signup and Google login write `uid`, `email`, `nickname`, `photoURL`, `createdAt`, `updatedAt`, `onboardingCompleted`, `onlineStatus`, and `lastSeen`. Profile edits also write `bio`, `interests`, etc. |
| `profiles/{uid}` | Public-facing profile mirror, generally same fields as `users`. Onboarding writes `nickname`, `interests`, `language`, `onboardingCompleted`, and `updatedAt`; edits write nickname, bio, photo URL, interests, and timestamp. |
| `matchmaking_queue/{uid}` | `status` and server `timestamp`; matched state adds `matchedWith` and `chatId`. Client code creates/updates/deletes queue entries. |
| `chats/{chatId}` | Match-created room with `id`, `status`, `startedAt`, and `participants`; chat UI later writes `ended`, `endedBy`, and a `typing` map. |
| `chats/{chatId}/messages/{messageId}` | `chatId`, `senderId`, `text`, local numeric `timestamp`, `type`, `isRead`, and server `createdAt`. Subscribed in created-at order. No deletion/retention operation is present. |
| `friend_requests/{requestId}` | `fromUid`/`toUid` legacy and `senderId`/`receiverId` fields, anonymous sender name, `chatId`, `status`, numeric timestamps, plus server-created timestamp. |
| `friendships/{autoId}` | `users` array, numeric `createdAt`, `status` (`active`/`blocked`), optional `blockedBy`, summary fields, and optional `chatId`. Friend request acceptance creates it. |
| `permanent_chats/{chatId}` | Uses friendship ID as chat ID; contains `id`, `participants`, numeric `createdAt`/`updatedAt`, optional message summary and typing state. |
| `permanent_chats/{chatId}/messages/{messageId}` | `chatId`, `senderId`, `text`, numeric `timestamp`, and `readBy` UID array. Messages are ordered by timestamp. |
| `notifications/{notificationId}` | `recipientId`, optional `senderId`, `type`, `title`, `message`, optional metadata, `isRead`, and numeric creation/update times. Created by client services. |

## Relationships and Data Flow

- Firebase Auth UID is the common user key; `users` and `profiles` are separately maintained copies.
- A friend request references sender/receiver IDs and may reference an anonymous chat. Acceptance creates a friendship with both UIDs in `users`.
- A permanent chat is keyed using the friendship document ID, and its participants are the friendship's UIDs.
- Notifications use `recipientId` and metadata such as `requestId` or `chatId`; creation is client-side.
- Anonymous chats are created by the matching client transaction. Queue listeners report the newly assigned chat ID to both clients.
- Profile/friend-list reads join friendship documents to user/profile documents in browser code. Friend list reads can issue one profile lookup per friendship.

## Realtime Listeners

Firestore `onSnapshot` is used for matchmaking queue documents, temporary chat documents/messages, friend requests, friendship list queries, permanent chat documents/messages, and notifications. Auth uses `onAuthStateChanged`. Permanent-chat read receipts update each received message individually. Listener cleanup is generally returned from React effects; match cancellation only sets an abort flag and does not itself unsubscribe or remove the queue record immediately.

## Schema and Consistency Caveats

- `users` and `profiles` are duplicate records updated independently; `AuthContext` swallows online-status update failures.
- Interfaces and runtime schema diverge. Generic `src/types/` uses `userId`, `displayName`, Firestore timestamps, and a `Report` type, while feature code uses `uid`, `nickname`, numeric times, and no report collection.
- Friend request models use both `fromUid`/`toUid` and sender/receiver field pairs. Legacy fallback queries exist.
- Friendship IDs are auto-generated, while permanent chat IDs reuse them. The helper assumes a friendship document exists when linking the chat.
- Message timestamp conventions differ between anonymous and permanent chats; ordering/display logic uses different fields.
- No server-side transaction coordinates request acceptance, friendship creation, and notification creation as one atomic operation.
- No retention cleanup is implemented for anonymous chats or messages. A timer ending in the UI is not a deletion policy.

## Security Rules Overview

Rules are in [firestore.rules](../../firestore.rules), attached in `firebase.json`. They default-deny paths not explicitly matched, but several collection-specific rules are broad. Any authenticated user can read/write the entire matchmaking queue; signed-in users can read every user/profile document; chat and permanent-chat creation are not constrained to valid participant sets; and any authenticated user can create notifications. Rule risks and priorities are detailed in [SECURITY_AUDIT.md](SECURITY_AUDIT.md). Rules were inspected in the repository, not confirmed as deployed.

## Storage, Functions, and Analytics

No Firebase Storage rules or Functions deployment config/source are present. Storage upload helpers and Firebase Functions client/emulator helpers exist only in the unused generalized services layer. No analytics SDK is initialized/called; measurement ID is only included in configuration.
