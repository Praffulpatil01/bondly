# Firestore Security Rules Design

This is a **design specification**, not deployable rules. Current [firestore.rules](../../firestore.rules) remains unchanged and is unsafe for the beta. Have the final rules compiled and tested in Firebase Emulator Suite before any staging/production deployment. The owner explicitly prohibited modifying rules in this task.

## Shared Predicates

Conceptual predicates used below:

```text
signedIn() := request.auth != null
betaMember(uid) := signedIn()
  && exists(/databases/$(database)/documents/beta_access/$(uid))
  && get(/databases/$(database)/documents/beta_access/$(uid)).data.enabled == true
  && get(...).data.expiresAt > request.time
self(uid) := signedIn() && request.auth.uid == uid
chat(chatId) := get(/databases/$(database)/documents/chats/$(chatId)).data
participant(chatId) := request.auth.uid in chat(chatId).participants
notBlockedEither(chatId) := no users/A/blocks/B and no users/B/blocks/A
activeAndUnexpired(chatId) := chat(chatId).status == 'active'
  && request.time < chat(chatId).expiresAt
```

Rules may call `get()`/`exists()` at additional read/cost and document-access-call limits. Use bounded helpers, validate the actual limit, and test query behavior. A beta allowlist is not a rate limiter. Firebase Console/Admin SDK actions bypass Firestore client rules and must be operationally restricted.

## Path Policy Matrix

| Match path | Read | Create | Update | Delete/list |
| --- | --- | --- | --- | --- |
| `/beta_access/{uid}` | `get` only for `self(uid)`; deny list | Deny clients | Deny clients | Deny clients. Trusted operator manages entries in Console. |
| `/beta_profiles/{uid}` | Owner only; optionally reveal only after a separately designed mutual-consent state. Avoid exposing full profile docs. | `betaMember(uid)`, self, exact allowed fields, bounded types/lengths. | Self, only editable fields; cannot change UID/creation time or inject email. | Self only if policy permits; deletion/account cleanup must also handle Auth identity. |
| `/match_intents/{sessionId}` | Owner get/list only. List must be constrained to `ownerUid == request.auth.uid`; operator Console can review all. | Beta member, `ownerUid == request.auth.uid`, random new ID, state=`waiting`, mode enum, bounded interests, server `createdAt == request.time`, `expiresAt` in a bounded future window. | Owner may make only `waiting -> cancelled`, with server cancellation time; cannot modify owner/mode/interests/expiry or set `assigned`. | Deny client deletes or permit only a narrow owner delete policy; never reactivate a generation. Operator may assign through Console. |
| `/match_state/{uid}` | Owner `get` only; no client list. | Deny clients. | Deny clients. | Deny clients. Operator writes match outcomes in Console. |
| `/chats/{chatId}` | Beta participant only; proposed reads until consent deadline, active reads until expiry; deny blocked pairs and arbitrary/nonexistent rooms. | Deny clients. Operator creates proposed room in Console after checking both intents/blocks. | Only participant; immutable participants/createdAt/consent deadline; allow `proposed -> active` only with both post-write accepted consents and `startedAt == request.time`, `expiresAt`/`reportUntil` within policy bounds; allow narrowly defined end/decline transitions. Compile-test all timestamp arithmetic. | Deny client deletes. Operator cleanup only. |
| `/chats/{chatId}/consents/{uid}` | Chat participants only while proposed and before consent deadline. | Beta, self path, UID in room participants, room proposed, one decision enum, server timestamp. | Deny after first choice; no flipping decline to accept. | Deny clients. |
| `/chats/{chatId}/messages/{messageId}` | Beta participant, chat active/unexpired, neither direction blocked. | Same plus `senderUid == request.auth.uid`, exact field allowlist, text string and approved max bytes, `createdAt == request.time`; chat active. | Deny client edits. | Deny client deletes; retention process handles expiry. |
| `/users/{uid}/blocks/{otherUid}` | Blocker only; `get` own path, no listing other users' blocks. | Beta, self path, distinct target, target must be valid UID; exact fields. | Deny. | Blocker may delete their own block only if unblock is in scope. |
| `/reports/{reportId}` | Deny client list. Reporter may get only own report if needed; moderator reads in Console. | Beta; reporter equals Auth UID; chat exists and reporter is participant; target is the other participant; room is within its approved report window even if ended; reason enum; bounded detail; exact fields; server timestamp; `reviewState == 'open'`. | Deny clients. | Deny clients. Operator reviews/updates through Console. |
| Legacy `/matchmaking_queue`, `/users`, `/profiles`, `/friend_requests`, `/friendships`, `/notifications`, `/permanent_chats` | Deny MVP clients unless another feature has separately approved rules. | Deny MVP clients. | Deny MVP clients. | Do not remove collections or documents in this planning phase. |

Because rules are additive across overlapping matches, preserve the current catch-all deny and audit every overlapping match block. A broad allow in the existing rules would override a new restrictive match; legacy broad grants must be removed under explicit approval, not merely supplemented.

## Specific Threat Controls

### Queue Access and Reuse

- An intent uses a random generation ID plus `ownerUid`; only the owner can read it. Firestore Rules must constrain client list queries to `ownerUid == request.auth.uid`. Clients cannot search other queue documents.
- Clients cannot set `matched`, `assigned`, or `active`; only trusted Console operations can write `match_state` and create rooms.
- Cancellation is one-way. Expired intent fails eligibility checks using `request.time`, even if the document has not been physically removed.
- A malicious allowlisted user can still create many own sessions unless bounded by an external/operational control. Rules cannot count all active sessions or enforce a robust rate limit. For beta, enforce one current session in UI and have operators monitor/clean; this is a known limitation, not a security guarantee.

### Room Joining and Consent

- Client room `create` is always denied. A random chat ID is not a capability; possession of the ID does not grant access.
- `participants` is immutable and exactly two UIDs. Reads/messages require authenticated participant, beta access, active room, unexpired time and no bilateral block.
- Consent documents are per-participant and immutable after their first decision. `getAfter` validates both acceptances when a participant changes proposed room to active in the same transaction.
- Operator Console can bypass rules, so console procedures must verify both queue entries, blocks, expiry, participant pairing and consent. The client cannot verify an operator action was fair.

### Message Validation

- Derive sender from Firebase Auth; never trust a `senderUid` argument from UI.
- Allow only `senderUid`, `text`, `createdAt` (and optionally an approved expiry field). No arbitrary `isRead`, role, participant, room status, or timestamps.
- Enforce type/size at rules and UI; UI limits are for usability, not security. Do not claim content filtering or abuse moderation.
- Do not permit reads/writes after expiry. This restricts access but does not physically erase data.

### Report/Block and Notifications

- Report path validates reporter/target against an existing chat. Reports are append-only from client; only trusted operator can read/review in Console. There is no notification collection in MVP; all client writes to legacy notifications are denied.
- Blocks can only be created by blocker; chat rules check block records in both directions. Operator must check blocks before pairing because Console bypasses rules.
- Firestore Rules cannot detect abusive language, adjudicate reports, notify staff outside Firebase Console, or throttle repetitive reports. Staff must have a review schedule. If moderators cannot respond, do not launch the report feature as monitored.

## Required Negative Tests

Run in Emulator Suite with anonymous and signed-out users. Every test must assert `permission-denied` where expected and successful access for the intended owner/participant.

1. Unapproved/signed-out UID reads/writes all beta paths; approved user lists another user's intent or `match_state`; intent query without the owner filter is denied.
2. User A changes another user's profile or edits immutable UID/creation fields.
3. A creates an intent with another `ownerUid`, changes B's intent, changes cancelled/expired state back to waiting, extends expiry, or reuses a session ID.
4. A client creates an arbitrary room, injects a third participant, changes participants/expiry, or opens a random room ID.
5. A sends a message with forged sender UID, invalid type/oversized text/extra fields, writes to ended/expired room, or modifies/deletes another message.
6. Nonparticipant C reads chat/message; blocked A/B read/send or activate a proposed room; verify either block direction denies.
7. One participant attempts activation before the other accepted; a participant changes their consent after choosing decline.
8. User forges reporter UID, targets self/nonparticipant, reports a nonexistent chat, edits status to resolved, lists all reports or reads someone else's report.
9. Any client creates or modifies a legacy notification, permanent chat, friendship, or legacy queue record through MVP routes.
10. A tries to reuse expired/cancelled intent or have operator-created state point to a mismatched chat/UID; operator procedure tests must cover console-created records separately because Admin operations bypass rules.

A successful emulator suite is necessary but not sufficient: conduct two-user staging tests and verify no sensitive profile fields are exposed. Do not deploy this design without a fresh rule review and explicit approval.
