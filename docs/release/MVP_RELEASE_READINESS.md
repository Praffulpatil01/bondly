# MVP Release Readiness

**Assessment: NO-GO for public release in the current state.** The app builds, but that is not evidence that core Firebase workflows are secure or operational. A public release should wait until the P0 gates below pass in a staging Firebase project and the product/privacy decisions are approved.

This is a planning-only assessment based on the ten files in `docs/project-context/` and a targeted reinspection of active auth, matching, chat, Firebase configuration, rules, and hosting source. No app, dependency, schema, rule, or production configuration changes were made. No Firebase project was contacted; live-service behavior remains unverified.

## Current MVP Fit

The requested MVP is guest-first access, interest selection, random and interest-based matching, realtime text chat, Next Stranger, disconnect, report/block, and responsive UI. The current repo has partial UI/service foundations for each except real guest access and report/block enforcement. The existing email/password and Google login, profiles, friendships, permanent chats, notifications, settings, and support views are outside this first-release scope and should be deferred from the MVP journey without deleting their code or migrating their data.

## Release Blockers

| Priority | Finding | Impact |
| --- | --- | --- |
| P0 | `firestore.rules` allows every authenticated user to read/write any matchmaking queue document. | Queue identity disclosure, queue tampering, and denial-of-service are possible. |
| P0 | Every authenticated user can read all `users` and `profiles`, including fields such as email, online state, and last seen. | Violates least privilege and anonymous/privacy expectations. |
| P0 | Client creates rooms and controls participant lists; rules do not validate creator, participants, room fields, or state transitions. | A hostile client can forge rooms or influence matchmaking and access. |
| P0 | Message rules only check participant membership and do not bind `senderId` to Auth UID, constrain content/size, or restrict fields. | Sender spoofing and arbitrary payloads are possible. |
| P0 | Authenticated clients can create notifications for arbitrary recipients; friendship and request rules also lack strict field/state validation. | Notification spoofing, spam, forged connections, or request abuse. |
| P0 | Report is a success toast only. Chat “block” merely ends the room; profile Block/Report controls are inert. No report store, moderation queue, or enforcement exists. | Safety affordances do not protect users or reach moderators. |
| P0 | Anonymous chat text is written to Firestore and is not deleted at timeout; UI copy claims anonymous chats are not stored after session end. | Material privacy/retention mismatch; retention policy and user disclosures are unresolved. |
| P1 | The “demo” localStorage marker bypasses route guards but is not Firebase Auth. Anonymous-auth helper exists in an unused service layer. | Guest-first journey is not real; local demo users cannot match or securely access Firestore. |
| P1 | Matching reads any `searching` queue entry, ignores selected vibe/interests, and runs on clients. Cancellation does not promptly unsubscribe/delete queue state; page fails after 15 seconds. | Random/interest matching, cancellation, privacy and two-user reliability are incomplete. |
| P1 | Skip ends the chat and returns to dashboard; it does not start Next Stranger. Timer expiry only changes local route state. | Required lifecycle actions are not implemented end to end. |
| P1 | No `firestore.indexes.json` exists although source uses compound equality/array queries for friend requests, blocks, and profile counts. | Live features may fail with missing composite-index errors; exact queries must be tested and indexes provisioned. |
| P1 | Firebase is initialized through two active config modules and one unused generalized layer; environment files and `.firebaserc` are tracked. | Risk of wrong-project builds and credential/history exposure; no committed values are reproduced here. |
| P1 | No test suite, Firebase Emulator config, rules tests, CI release gate, Hosting headers, or production rollback/runbook is present. | No repeatable evidence or release safety net. |
| P2 | Brand says Ryple in app and Bondly in repository/design reference. Landing claims AI matching and safety/privacy behavior not implemented. | User trust and release identity are inconsistent. |
| P2 | Responsive CSS exists, but no viewport/browser verification; accessibility semantics and reduced-motion behavior are uneven. | Mobile usability and accessibility are not release-verified. |
| P2 | Build emits large JS chunk (~1 MB minified), ineffective dynamic imports and a Vite `__dirname` warning. | Performance and future build-tool compatibility concerns; not the first security gate. |

## Firebase and Deployment Assessment

- `firebase.json` deploys `dist` to Firebase Hosting and rewrites routes to `index.html`; rules deploy from `firestore.rules`.
- Auth and Firestore are initialized from `VITE_FIREBASE_*`. The actual project alias/IDs and env contents were not displayed. Staging and production project separation is not established by the visible deployment config.
- No Functions source/config, Firestore index file, Storage rules, Emulator Suite config, report collection/service, or abuse/moderation backend was found.
- The current `npm run build` was previously verified successful. Auth provider setup, real Firebase permissions, indexes, quota, Hosting, and multi-client functionality are unverified.
- Anonymous Auth, Firestore, and Hosting can be evaluated within Firebase no-cost limits, but production traffic can exceed quotas and suspend/limit service. A secure trusted matchmaking/reporting boundary using Cloud Functions generally requires the Blaze billing plan; it is not a guaranteed zero-dollar service. Do not promise zero cost or enable billing until usage, budget alerting, and project-owner approval are agreed.
- SMS Auth, paid captcha products, media storage, and AI moderation are excluded from MVP to avoid avoidable metered costs.

## Required Go/No-Go Gates

1. Product owner confirms Bondly vs Ryple, guest identity behavior, interest matching semantics, session duration, anonymous retention/deletion, block semantics, report response expectations, and minimum-age/community policies.
2. Threat model and least-privilege Firestore rules are approved, rules tests pass, and the same release candidate has been deployed/tested in staging. Production rules remain untouched pending explicit approval.
3. Trusted matching and report/block write/enforcement architecture is selected with a billing decision. If Cloud Functions/Blaze is rejected, a secure alternative must be selected and tested; current unrestricted client queue is not an acceptable fallback.
4. Firebase anonymous Auth is wired and tested across fresh, returning, signed-out, and network-error sessions. No localStorage value may authorize backend access.
5. Two independent Firebase users pass random and shared-interest matching, text chat, next/disconnect, report/block, reconnect and queue-cleanup acceptance tests.
6. Privacy/retention copy matches actual behavior; a user-facing report flow reaches an owned moderation queue and block enforcement applies to matching and chat.
7. Responsive browser QA, security/rules test suite, clean production build, Hosting preview, rollback plan, monitoring and cost thresholds are documented and approved.

## Scope to Defer

Keep existing code/features intact, but do not put these in the initial MVP journey: email/password and Google account creation/linking, permanent friendships and long-term chat, friend/profile directory, notifications, achievements/stats, public profile editing/photo upload, privacy settings beyond enforced MVP controls, and support-message form. Remove unsupported AI, deletion, verification, and social-proof claims from the MVP-facing experience or leave those surfaces unadvertised until accurate. Do not introduce paid SMS, Storage, scheduled jobs, or AI moderation without a separate cost/product decision.

The task-by-task sequence is in [MVP_IMPLEMENTATION_PLAN.md](MVP_IMPLEMENTATION_PLAN.md), test gates in [MVP_TEST_PLAN.md](MVP_TEST_PLAN.md), deployment in [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md), and sign-off checklist in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
