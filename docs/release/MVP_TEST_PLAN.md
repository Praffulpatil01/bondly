# MVP Test Plan

**Status:** plan only. The repository currently has no test files, test script, Firebase Emulator Suite configuration, or browser automation. No tests in this plan have been run. Do not treat the previous TypeScript/Vite production build as evidence of Firebase correctness.

## Environments and Test Data

- Use Firebase Emulator Suite for repeatable Auth/Firestore/rules integration tests. No emulator config is present today; add it only after approval.
- Use a separate staging Firebase project for provider, indexes, Functions, Hosting, quota and real two-device smoke checks. Never run destructive or adversarial tests against production.
- Use two independent guest Auth identities (`User A`, `User B`) in separate browser contexts/devices. A localStorage demo marker is not a test identity.
- Seed only synthetic profiles/interests. Capture test run ID, build SHA, emulator/staging project alias (not credentials), browser/device, timestamps, and results.

## Test Matrix

| ID | Area | Scenario | Expected result / evidence |
| --- | --- | --- | --- |
| T-SEC-01 | Firestore rules | Unauthenticated caller reads/writes each protected collection and subcollection. | Denied; emulator rules output attached. |
| T-SEC-02 | Firestore rules | User A reads/updates User B profile/private account fields. | Only explicitly public fields/routes are readable; private fields and writes denied. |
| T-SEC-03 | Firestore rules | User A reads/overwrites/deletes User B queue entry or creates a room with arbitrary participants. | Denied; only trusted matching path can claim queue/create rooms. |
| T-SEC-04 | Firestore rules | Nonparticipant reads chat or messages; participant submits forged sender UID, invalid status, oversized text, or extra fields. | Denied by rules/backend validation. Valid bounded text from actual sender succeeds. |
| T-SEC-05 | Firestore rules | Spoofed report/notification/friendship/request payload and unauthorized status transition. | Denied; user cannot assign recipient/reporter or mutate protected fields. |
| T-SEC-06 | Firestore rules | Anonymous Auth user invokes intended guest operations; signed-out and random forged localStorage flag attempts same operations. | Anonymous user allowed only intended MVP operations; no Auth and localStorage flag grants no access. |
| T-AUTH-01 | Guest journey | First visit creates anonymous Firebase Auth identity, completes interest choices and refreshes. | Guest remains the same Auth UID per persistence policy; selections restore; no email/login gate. |
| T-AUTH-02 | Guest journey | Sign out, clear session, network unavailable during initial auth/profile bootstrap. | Protected access revoked on signout; explicit retry/error behavior; no placeholder identity accepted. |
| T-MATCH-01 | Two-user random matching | A and B choose random; each enters queue simultaneously. | Exactly one active room with exactly A/B participants; both receive same room ID; neither self-matches. |
| T-MATCH-02 | Interest matching | A and B have overlap meeting threshold; C does not. | A/B match; C is not chosen while eligible match exists; shared interest result follows approved policy. |
| T-MATCH-03 | Interest fallback | No matching interests exist and random fallback is enabled/disabled in separate runs. | Behavior matches disclosed setting; no hidden silent fallback. |
| T-MATCH-04 | Concurrency/abuse | Three or more clients race; repeat queue/join requests; user opens two tabs; another user submits forged IDs. | A user enters at most one queue/room; transactions are idempotent; invalid callers cannot pair/claim others. |
| T-CHAT-01 | Realtime messaging | A and B send text concurrently in separate clients. | Each authorized message appears once for both clients in a consistent order with server-validated sender. |
| T-CHAT-02 | Realtime messaging | Reconnect after temporary offline, reload chat route, submit empty/oversized/control-character input. | Authorized persisted messages recover once; invalid/empty payload rejected with accessible error. |
| T-CHAT-03 | Permission/lifecycle | After room ended, either user attempts to read/send; unrelated C tries to read. | Ended-room write is rejected; C is denied; UI reflects ended state. |
| T-LIFE-01 | Next Stranger | A chooses Next Stranger during active A/B chat; B remains. | Old room ends for both; A queues once for next match; old room cannot receive new messages; B sees clear disconnect outcome. |
| T-LIFE-02 | Disconnect | A disconnects or closes tab; also test B disconnecting. | Other user sees ended/disconnected state; stale queue/room transitions eventually clean up under defined SLA. |
| T-LIFE-03 | Reconnect | A loses network, reconnects before/after disconnect/timeout; retries actions. | Correct state is reloaded from trusted source; no duplicate queue or ghost session. |
| T-QUEUE-01 | Queue cleanup | Cancel before match, match timeout, browser close, rejected transaction, backend cleanup/expiry. | Queue state is removed/expired within documented SLA; no stale record can match later; cleanup event is auditable. |
| T-SAFE-01 | Report | A reports B with each supported reason; duplicate/abusive submissions; B attempts to read report. | Report is durably accepted once, reporter/target fields are authoritative, review queue restricted to moderators, no disclosure to B. |
| T-SAFE-02 | Block | A blocks B during chat and from any supported entry; then both attempt rematch/message/request in either direction. | Active session ends and no future match/chat/request can be established; action survives refresh. |
| T-SAFE-03 | Moderation operations | Authorized moderator views and resolves report; ordinary guest attempts same. | Reviewer role is backend-enforced; resolution/status audit is recorded; unauthorized access denied. |
| T-ABUSE-01 | Abuse prevention | Anonymous account churn, match join/cancel loops, message flood, report flood, queue enumeration and rapid retries. | Rate limits/caps and abuse signals engage; no cross-user data leak; service remains within agreed cost ceiling. |
| T-PRIV-01 | Retention | End chat by timeout, Next Stranger, disconnect, report, and cleanup policy. | Stored data matches published retention; report evidence follows explicit exception policy; deletion verified in Firestore. |
| T-UI-01 | Mobile | Test 320/360/390px widths, iOS/Android keyboard open, safe-area inset, portrait/landscape. | Controls remain visible; composer is not obscured; timer/report/Next Stranger are operable; no horizontal overflow/overlap. |
| T-UI-02 | Desktop/accessibility | Test common laptop and wide desktop, keyboard only, screen-reader smoke, 200% zoom, reduced motion. | Responsive layout is stable; focus/order/names/status announcements work; contrast and motion meet acceptance targets. |
| T-BUILD-01 | Build/release | Clean locked install and production mode build with staging/prod config injected in CI. | `npm ci` and `npm run build` pass; no missing env data in logs/artifact; artifact references correct project. |
| T-DEPLOY-01 | Hosting | Deploy only to staging preview/site and exercise deep links/rewrite, headers, error routes, cache behavior. | Routes load directly; HTTPS and security headers verified; no production project touched. |
| T-COST-01 | Cost/quotas | Simulated representative and burst traffic; monitor reads/writes/listeners/function calls/egress. | Usage remains below owner-approved operational limits; alerts reach owners; matching can be disabled safely at threshold. |

## Required Evidence and Exit Criteria

- All T-SEC cases pass in Emulator Suite before staging deploy; production rules are not used as a test environment.
- T-MATCH, T-CHAT, T-LIFE, T-QUEUE, T-SAFE, and T-PRIV pass with two real staging guests and repeatable logs/screenshots.
- No open P0/P1 defect. Every report has an assigned moderation owner and response process.
- T-UI checks pass on a real mobile browser and desktop browser; build-only or CSS inspection does not count.
- Clean build and Hosting staging smoke pass on the exact candidate SHA; staging rules/indexes/backend version are recorded.
- Cost and quota owner signs off on the measured expected load, thresholds, billing account/plan and shutdown response.

## Test Command Status

There is currently no `npm test` command or test suite. `npm run build` is available and was previously observed to pass, but generated a large-chunk warning and Vite config/import warnings. Establish the approved Emulator Suite commands and CI tasks during REL-01; do not claim tests pass until output is captured for this release candidate.
