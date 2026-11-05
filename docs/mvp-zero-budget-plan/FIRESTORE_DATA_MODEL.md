# Proposed Firestore Data Model

Planning only. These are proposed MVP paths and fields; no schema or rules have been changed. Keep existing collections/features in place but isolate them from the beta routes. A migration and compatibility plan is required before replacing any existing path.

## New/Adjusted MVP Documents

| Path | Proposed fields | Client access and purpose |
| --- | --- | --- |
| `beta_access/{uid}` | `enabled: boolean`, `expiresAt: timestamp`, `cohortId: string`, `approvedAt: timestamp` | Manually managed through trusted Firebase Console only. A guest may `get` only its own record; no list/write access. Rules use it as an allowlist gate. |
| `beta_profiles/{uid}` | `nickname: string`, `interests: string[]`, `createdAt: timestamp`, `updatedAt: timestamp` | Owner only. Minimal; no email, phone, photo URL, online status, or real-world identity. Not publicly readable before a match. |
| `match_intents/{sessionId}` | `ownerUid: uid`, `mode: 'random' \| 'interests'`, `interests: string[]`, `state: 'waiting' \| 'cancelled' \| 'assigned'`, `createdAt: timestamp`, `expiresAt: timestamp`, `cancelledAt?: timestamp` | Owner creates a new random session ID and reads/listens only to intents where `ownerUid` is their UID. A constrained list query must include that owner filter. Owner may transition `waiting -> cancelled` once; operator reads/updates via Console. User cannot reactivate or write `assigned`. Top-level path allows an operator to review the small cohort in Console without granting clients queue-list access. |
| `match_state/{uid}` | `chatId?: string`, `assignedAt?: timestamp`, `updatedAt: timestamp` | Owner may read/listen only. Client writes denied; operator writes assignment through Console. The client follows the assigned chat for consent/lifecycle state. |
| `chats/{chatId}` | `participants: [uidA, uidB]`, `status: 'proposed' \| 'active' \| 'declined' \| 'ended'`, `createdAt: timestamp`, `consentDeadline: timestamp`, `startedAt?: timestamp`, `expiresAt?: timestamp`, `reportUntil?: timestamp`, `endedAt?: timestamp`, `endedBy?: uid` | Created by operator through Console, never client. Participants and consent deadline are immutable. Timer/expiry/report window are set at mutual activation from trusted request time; participants only may make tightly constrained status transitions. |
| `chats/{chatId}/consents/{uid}` | `decision: 'accepted' \| 'declined'`, `createdAt: timestamp` | Each participant can create their own one-time decision while room is proposed. Decision cannot be changed. Needed before messages are enabled. |
| `chats/{chatId}/messages/{messageId}` | `senderUid: uid`, `text: string`, `createdAt: timestamp`, optional `expiresAt: timestamp` if collection-group TTL is approved | Active participants may create bounded text with sender fixed to Auth UID; participants may read only before room expiry and when unblocked. No client update/delete. |
| `users/{uid}/blocks/{otherUid}` | `createdAt: timestamp` | Blocker can create/read/delete only their own block docs. No reason/free text required for MVP. Rules consult both directions before chat reads/writes and activation. |
| `reports/{reportId}` | `reporterUid: uid`, `targetUid: uid`, `chatId: string`, optional `messageId: string`, `reason: enum`, optional bounded `details: string`, `createdAt: timestamp`, `reviewState: 'open'` | Client may create a valid report only as a chat participant about the other participant. Client cannot list, edit, resolve, or delete reports. Operator reviews through Console (Admin SDK bypasses client rules). |

No `notifications` collection is required for this MVP. Do not create a notification path that any client can target. Avoid storing a message excerpt in reports by default; if moderation requires evidence, define a narrowly scoped, explicitly disclosed retention policy.

## Document Lifecycle

### Guest and Profile

- Firebase Anonymous Auth UID is the document owner; do not use localStorage for identity.
- Manually add beta access after the guest shares the UID through the agreed onboarding process.
- Profile stores only chosen nickname/interests. Anonymous account persistence is browser/device scoped; cleared storage can result in a new UID and manual reapproval.

### Match Intent

- A new random `sessionId` prevents reuse of an old/cancelled intent document.
- `createdAt` must be a server timestamp (rules can compare it to `request.time`); `expiresAt` must be within an approved maximum window and cannot be extended by the client.
- Clients cannot query other users' intents. The operator is the only matching actor under the recommended Spark-only design.
- Client cancellation is one-way. An expired/cancelled intent is never reset to waiting; create a new session instead.

### Chat and Mutual Consent

- Console operator creates a proposed room only after checking both users are allowlisted, waiting, eligible under selected mode, not blocked in either direction, and not already assigned. The timer has not started yet; the room has a bounded consent deadline.
- Each user writes one decision at `consents/{theirUid}`. Rules require that path UID equal Auth UID and be one of immutable participants.
- Activating the chat must be a transaction/batch whose post-write state has both accepted consent documents; the second accepter sets `startedAt`, `expiresAt`, and `reportUntil` from trusted request time within approved duration bounds. Validate `getAfter` and timestamp arithmetic in rules tests. No message read/write before activation.
- Once active, room `expiresAt` and `reportUntil` are immutable. Rules compare trusted `request.time` against them for chat/message access and report eligibility.

### Reports and Blocks

- Block remains until the blocker removes it; rules check both `users/A/blocks/B` and `users/B/blocks/A`.
- Reports are append-only and private. Allow the participant report window after the room ends, until `reportUntil`; Firebase Console is the moderator interface. Do not add a client moderator flag or client-editable resolution.
- Manual deletion schedule, report evidence exceptions, and user disclosure must be decided before messages are stored.

## Existing Schema Compatibility

The active repo currently uses `users`, `profiles`, `matchmaking_queue`, `chats`, nested `messages`, `friend_requests`, `friendships`, `permanent_chats`, and `notifications`. Existing `users`/`profiles` may contain email and other fields; Firestore cannot return a document with selected fields only. Do not grant the new app access to those old documents as a way to show a nickname. Create a minimal `beta_profiles` path or migrate data under approved rules.

Do not delete or rename existing collections as part of this plan. Keep existing permanent friendship/profile feature code untouched; prevent those routes from being part of beta until their authorization is separately reviewed. The legacy `matchmaking_queue` must not remain client-readable/writable for beta users after rules hardening, or old client code can bypass the proposed private intent model.

## Indexes and Deletion

No `firestore.indexes.json` exists. The proposed client only queries its own match-state document and messages by `createdAt`; operator Console queries may need indexes if compound filters are added. Add only indexes proven by emulator/staging queries.

`expiresAt` access checks do not delete stored documents. Spark-only fallback is an operator-run, documented cleanup procedure in Firebase Console. Evaluate Firestore TTL for both chat parent and message collection group only after confirming current Spark availability, pricing, collection-group behavior and deletion semantics. Firestore parent deletion does not recursively delete subcollection messages; test cleanup explicitly. A retention claim must distinguish “access disabled at expiry” from “physically deleted by deadline.”
