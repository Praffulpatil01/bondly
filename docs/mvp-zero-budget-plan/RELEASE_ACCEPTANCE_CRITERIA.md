# Zero-Budget Beta Release Acceptance Criteria

These criteria define an invite-only private beta, not a public launch. No criteria are marked passed; implementation and live testing are pending. A build passing alone is insufficient.

## Product and Operations

- [ ] Product name is confirmed (Bondly vs current in-app Ryple) and beta-facing title/copy are accurate.
- [ ] Beta is limited to 20–50 manually approved testers; users are told pairing may be manually facilitated and may not be immediate.
- [ ] Named operator(s) have Console access, MFA, pairing/report/cleanup runbooks and coverage during beta hours.
- [ ] Minimum-age, harassment/escalation, block, report SLA, anonymous chat retention and account-loss policies are approved and shown to users.
- [ ] No UI claims AI matching, guaranteed random fairness, immediate deletion, end-to-end encryption, automated moderation, or real-world identity verification unless later implemented and verified.

## Authentication and Access

- [ ] Guest session is real Firebase Anonymous Auth; no login/signup gate is required for MVP.
- [ ] Pending beta users cannot read/write beta data before their UID is manually allowlisted.
- [ ] Allowlist is self-unreadable except own record, non-listable and client-nonwritable.
- [ ] Local storage, route state, guessed document IDs and direct SDK calls do not bypass Firestore Rules.
- [ ] New UID after clearing browser storage requires a new approval; no false account-recovery promise.

## Matching and Consent

- [ ] Match intents are owner-private; client cannot inspect candidate queue, set matched state, create rooms or assign arbitrary participants.
- [ ] Random and interest-based selections follow the approved manual operator procedure; no silent interest fallback.
- [ ] Operator checks active/waiting status, intent expiry, access status and blocks in both directions before pairing.
- [ ] Operator-created room contains exactly two participants and immutable expiry.
- [ ] Both participants explicitly accept the proposed room before chat is active; a decline prevents messages.
- [ ] Next Stranger ends old room before creating a fresh intent; Disconnect ends access and returns safely.
- [ ] Expired/cancelled sessions and rooms cannot be reused; client clock manipulation does not extend server-rule access.

## Chat, Safety, Privacy

- [ ] Text messages are realtime, persisted in Firestore and visible only to approved, unblocked participants while active/unexpired.
- [ ] Sender UID comes from Auth and is validated by Rules; text size/shape and allowed fields are bounded.
- [ ] No messages can be read/written after room expiry/end; privacy copy distinguishes access cutoff from physical deletion.
- [ ] Block persists and prevents both directions of read/write and future operator pairing.
- [ ] Valid reports are stored privately and accessible to the designated operator; forged reporter/target/status and report listing fail.
- [ ] Operator review cadence and escalation are staffed; otherwise beta is blocked.
- [ ] Physical deletion of chat and nested messages is verified by the agreed manual process or by TTL only after verified availability/behavior. Do not claim deletion until confirmed.

## Security and Testing

- [ ] All negative tests in [TEST_STRATEGY.md](TEST_STRATEGY.md) pass against Emulator Suite, including queue access, forged sender, unrelated chat reads, arbitrary rooms, reports/notifications, profile ownership, block bypass and stale intents.
- [ ] All intended positive tests pass (owner profile/intent, valid consent, matched messages, report create, block create, own match state).
- [ ] Two independent allowlisted anonymous UIDs complete random and interest match, consent, real-time text exchange, reconnect, Next Stranger, Disconnect, report, block and retention tests in staging.
- [ ] Firestore Rules are compiled/tested with no overlapping legacy allow grants; production rules are not used for test attacks.
- [ ] Manual Console-created records are checked separately because Admin operations bypass client rules.
- [ ] No unresolved P0/P1 bug, no unbounded leak of profiles/intents, no public queue enumeration.

## Responsiveness and Build

- [ ] Mobile browser tested with keyboard, safe areas and viewport widths; desktop layout tested. No overlap or hidden essential controls.
- [ ] Keyboard/screen-reader labels, focus, contrast and reduced motion checked for auth pending, interest selection, wait, consent, chat, report/block and errors.
- [ ] `npm ci` and `npm run build` pass on release SHA with intended Firebase project config; build artifacts/logs contain no private credentials.
- [ ] No dependency or package-lock changes occur without separate approval.

## Zero-Budget and Release Controls

- [ ] Firebase project remains on Spark; no Blaze enablement or billing account assumption is required for the selected features.
- [ ] Owner has verified current Firebase pricing, Spark service availability and quota limits from official docs and project Console; no numeric assumption from this plan substitutes for that check.
- [ ] Representative staging resource usage has been measured, with agreed beta caps/headroom and stop procedure.
- [ ] No paid APIs, SMS, paid AI, paid captcha, Cloud Functions/Cloud Scheduler or Storage were introduced.
- [ ] Environment/project IDs are separated; tracked env files/history have been reviewed securely without copying values; deploy target has a two-person check.
- [ ] Hosting rollback and operator stop procedure are rehearsed; production deploy is separately approved.

## Final Decision

- [ ] **Conditional GO:** all criteria above pass for a staffed, manually paired 20–50 person private beta.
- [ ] **NO-GO:** any security, privacy, moderation, retention, cost or operational criterion remains open.
- [ ] **NO-GO for autonomous public matching under Spark:** do not restore the current global client queue or imply server-side rate limiting/moderation.

**Product owner:** ____________________  **Date:** __________

**Security/Firebase owner:** ____________________  **Date:** __________

**Beta operator:** ____________________  **Date:** __________
