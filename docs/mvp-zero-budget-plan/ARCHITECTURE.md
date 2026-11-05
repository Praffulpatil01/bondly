# Zero-Budget MVP Architecture

## Recommendation

Use the existing React/TypeScript/Vite/Tailwind/Firebase stack, but do **not** release the existing autonomous client matchmaking flow under a strict Spark-only constraint. The safer 20–50 tester beta is **invite-only, Firebase Anonymous Auth, manually mediated pairing, mutual chat consent, real Firestore chat, console-reviewed reports, rules-enforced blocks**.

This is not a rebuild and does not delete existing features. The beta route set should expose the required guest/match/chat/privacy flows while existing account, friendship, permanent-chat and notification code stays untouched and out of the beta journey. The current `matchmaking_queue` client code should not be used by the zero-budget design because its rules currently let every authenticated user read/write every queue record.

**Important limitation:** this design avoids a paid trusted server by assigning a trusted human operator to match and review reports from Firebase Console. Firestore Rules do not perform random selection, rate-limit users, moderate content, or run cleanup. A 20–50-person beta can be operated manually, but it is not an autonomous public launch architecture.

## Existing Building Blocks

- Vite/React route tree in `src/main.tsx`; reusable auth, chat, input, and loading components.
- Firebase JS SDK is already installed. An unused `signInAnonymously()` helper is in `src/services/firebase/auth.ts`; active `AuthContext` does not use it.
- Firestore chat and message paths/listeners exist in `src/features/chat/`; current message writes and room creation are client-originated.
- Interests are collected in `src/features/onboarding/pages/OnboardingPage.tsx` but are not used by `MatchmakingService`.
- Current `firestore.rules` are not acceptable for beta; all authenticated users can read/write the shared queue and read all `users`/`profiles` documents.
- No indexes, Emulator Suite configuration, rules tests, report backend, or Firebase Functions source is present.

## Components and Trust Boundaries

| Component | Responsibility | Trust boundary |
| --- | --- | --- |
| React/Vite client | Anonymous Auth, onboarding, queue request, match-state listener, per-chat consent, text messages, timer display, block/report controls. | Untrusted. UI and local storage never authorize access. |
| Firebase Anonymous Auth | Stable UID for an anonymous guest in a given browser persistence context. | Authenticated identity, not proof of a real person or a beta invitation. No account recovery unless a separate linking flow is later approved. |
| Firestore + Rules | Store minimum profile/intent/chat/message/block/report fields; enforce per-UID ownership, participant membership, consent state, message validation, and expiry reads/writes. | Rules validate each operation; they cannot choose a match, throttle a user, detect harmful content, or execute a scheduled cleanup job. |
| Firebase Console operator | Manually approves beta UID, reviews interests/queue, pairs two opted-in guests, creates a proposed room and private match-state records, reviews reports, and performs cleanup. | Privileged administrative boundary. Restrict console access with MFA/least privilege; manually record actions. |
| Firebase Hosting | Serves the existing SPA and deep-route rewrite. | Static client delivery; not a trusted backend. |

## Guest and Beta Access Lifecycle

1. Visitor loads the public client and signs in with Firebase Anonymous Auth. Do not treat `Ryple_demo_user` or any localStorage key as authentication.
2. Before Firestore product access, the UI shows the anonymous UID and a “beta access pending” state. A trusted operator manually creates `beta_access/{uid}` with enabled/expiry metadata in the Firebase Console. Do not add a public self-registration path to that collection.
3. Firestore Rules check both `request.auth != null` and an enabled, unexpired `beta_access/{request.auth.uid}` document for all beta data. Client can read only its own access record; clients cannot list or modify the allowlist.
4. Allowlisted user writes a minimal, private `beta_profiles/{uid}` record and a match intent. Keep email, phone, real name, photo URL and other identifying details out of beta data.
5. Sign-out or clearing browser storage can result in a new anonymous UID and a new manual approval request. State this clearly. Account linking/recovery is deferred.

This is an operational invitation gate, not protection against Firebase project abuse before authentication or against an authorized tester who misuses the client. Firebase App Check can be evaluated as an additional abuse signal, but it is not an allowlist or a rate limiter and its provider requirements/cost must be checked before use.

## Matching and Consent Lifecycle

1. User chooses `random` or `interests` and creates a new intent under top-level `match_intents/{sessionId}` with their UID as owner. It contains only mode, selected interest IDs, timestamps, state and expiry; there is no client-queryable candidate pool.
2. User listens only to `match_state/{uid}`. No client can list other users' intents or mutate another user's intent/state.
3. Operator reviews waiting intents in Firebase Console. For `random`, selects an eligible waiting pair using a documented random process. For `interests`, selects users meeting the approved overlap rule. Operator checks both queue states and both block paths before creating a match.
4. Operator creates a `chats/{chatId}` room in `proposed` state and writes `match_state/{uid}` for both guests. The proposed room contains only the two participant UIDs and a consent deadline; client chat creation is denied by rules.
5. Each participant sees a neutral proposed-match screen and writes only their own consent document. No messages are readable/writable before both consent. One participant may decline; operator/client transition leaves the room inactive and closes both match states.
6. Once both consent documents say accepted, the second accepter may make a narrow status transition to `active`; rules require both consent records in the same post-write state (`getAfter`) and set `startedAt`, `expiresAt`, and `reportUntil` from trusted `request.time` within approved bounds. Duration arithmetic must be compiled and validated in Emulator Suite before use.
7. On active chat, only participants can listen/send bounded text before `expiresAt`. The app timer is only presentation; Firestore Rules also reject post-expiry reads/writes using `request.time`.

The operator process supplies random/interest pair selection. It is not instantaneous or scalable; beta copy must say that matching may be manually facilitated. If instant autonomous matching is mandatory, the strict no-Blaze constraint blocks the recommended secure design.

## Chat, Next Stranger, Disconnect

- Reuse the current `chats/{chatId}/messages` UI/service surface after aligning it to a minimal MVP message schema and Auth-derived sender ID.
- Message `senderUid` must equal `request.auth.uid`; `text` is a bounded string; `createdAt` is server time; no arbitrary extra fields. No images, attachments, reactions, or permanent chat in MVP.
- `Next Stranger` and `Disconnect` both end the active room for this MVP, but have different destinations: Next creates a new intent after closing the old room; Disconnect returns to dashboard/landing. Neither button alone proves the other user left.
- End/expiry status is checked from Firestore, not only local navigation. The timer begins on mutual activation, not when the proposal is created. Reconnect reloads the match-state/chat state.
- Rules cannot guarantee immediate state changes if a device disappears. A human operator handles stale states; expiry blocks chat access even if deletion is delayed.

## Report, Block, and Retention

- Block is stored at `users/{uid}/blocks/{otherUid}` and is private to the blocker. Rules deny room reads/writes if either participant has blocked the other. The operator checks both directions before pairing. Blocks remain enforceable after client refresh.
- Report is a client-created append-only record only for the other participant of a valid chat, with an allowed reason and chat/message reference. Rules bind reporter to Auth UID and restrict payload shape. Client cannot set review resolution or read other users' reports. Operator reviews records through Firebase Console.
- There is no automated moderation, urgent response, or abuse throttling. Beta access should be small, explicit, staffed, and invite-only. If no operator can review reports on the stated schedule, do not expose the Report affordance as monitored.
- Chat/message retention duration must be approved and communicated before beta. Rules deny access after immutable `expiresAt`; this is not physical deletion. With no trusted scheduled backend, the zero-budget fallback is a documented manual cleanup job in Console. Verify Firestore TTL availability, billing and subcollection behavior before relying on TTL; parent deletion does not imply recursive deletion of messages.

## Security Limits and Go/No-Go

Firestore Rules can enforce identity, ownership, schema allowlists, participant membership, mutual consent, block checks, and time-window access. They cannot securely run matchmaking, rate-limit authorized clients, prevent unlimited anonymous account creation, validate a human's age, detect/report harmful content, ensure console operators honor policy, or guarantee timely physical cleanup.

**Conditional GO:** private beta only if manual pairing/review is accepted, Firebase access is manually allowlisted, rules tests pass, and retention/operator processes are ready.

**NO-GO:** autonomous/random instant matching with a shared client-readable queue, unstaffed reporting, claims of immediate deletion, or a zero-cost guarantee. Upgrade to a trusted backend only after separately approving a billing plan; do not enable Blaze in this plan.

Related details: [FIRESTORE_DATA_MODEL.md](FIRESTORE_DATA_MODEL.md), [SECURITY_RULES_DESIGN.md](SECURITY_RULES_DESIGN.md), [MATCHMAKING_DESIGN.md](MATCHMAKING_DESIGN.md), [COST_AND_LIMITATIONS.md](COST_AND_LIMITATIONS.md).
