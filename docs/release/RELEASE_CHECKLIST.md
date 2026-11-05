# MVP Release Checklist

Release is **NO-GO** until all P0 security/safety gates and all applicable P1 functional gates are checked and evidence is attached to the release record. This checklist is blank because no release implementation or staging tests have been performed as part of this request.

## Product and Policy

- [ ] Confirm Bondly vs Ryple; align MVP title, app metadata, support identity and launch copy.
- [ ] Approve guest identity behavior, interest-match overlap/fallback rules, session duration, Next Stranger vs Disconnect semantics, and anonymous transcript retention.
- [ ] Approve minimum age, community rules, report reasons/escalation, moderation response owner/SLA, block behavior, and incident contact.
- [ ] Publish accurate privacy/retention terms; remove unsupported AI, ephemeral deletion, verification, or safety guarantees.

## Security and Backend (P0)

- [ ] Review threat model and least-privilege Firestore rules; production rules changes have explicit owner approval.
- [ ] Rules Emulator Suite passes unauthenticated, cross-user, participant, forged sender, invalid-field, queue, request, report, notification, and block negative cases.
- [ ] Trusted matchmaking/report/block design approved; no globally readable/writable client queue or client-authoritative participant assignment remains.
- [ ] Every write validates Auth UID, IDs, field allowlist, type/size, status transition, rate limits and idempotency.
- [ ] Anonymous chat privacy/retention behavior is implemented, measured and consistent with policy, including report evidence exceptions.
- [ ] Block enforcement verified in both match directions, active chat, future messages and retries.
- [ ] Report submission is durable, private from reported user, visible only to authorized moderators, and has a staffed response process.
- [ ] Tracked environment files and Git history have been reviewed securely; any privileged secret is rotated; no secret values were copied to docs/logs.
- [ ] Auth uses real Firebase anonymous identity; a forged localStorage value cannot access protected routes/data.

## Core MVP Journey (P1)

- [ ] New visitor starts as a Firebase guest without email/login gate; refresh persistence is defined and verified.
- [ ] Guest selects and persists interests; random mode and interest mode behavior are explicit and honored by matcher.
- [ ] Two independent users match exactly once and receive the same authorized room.
- [ ] Realtime text messages persist and appear once for both authorized users; unauthorized/oversized writes fail.
- [ ] Reconnect restores authoritative state; no ghost or duplicate queue/chat appears.
- [ ] Next Stranger ends old room and safely begins a new queue; Disconnect ends/leaves the session and returns to a safe destination.
- [ ] Cancel, timeout, browser close, network failure, and transaction retry all clean/expire queue state within documented SLA.
- [ ] Error, empty, retry, and ended states do not claim success before backend confirmation.

## Responsive UI and Accessibility (P2)

- [ ] Mobile widths, keyboard-open composer, safe areas, orientation and desktop layout pass browser checks with evidence.
- [ ] No overlap, hidden primary action, horizontal overflow, or unreadable time/action controls.
- [ ] Keyboard and screen-reader smoke tests pass; icon buttons have accessible names; focus, contrast and status announcements are checked.
- [ ] Reduced-motion preference is respected; privacy/safety copy matches shipped behavior.

## Build, Staging, and Operations (P3)

- [ ] Clean `npm ci` and production-mode build pass on exact candidate SHA; artifact points to intended environment.
- [ ] Required Firestore composite indexes are committed/deployed to staging and all production queries tested.
- [ ] Staging Firebase project is separate from production; Auth domains/providers, rules/indexes, backend config and Hosting target are reviewed.
- [ ] Full Firebase rules suite and all required two-user tests pass on the release candidate.
- [ ] Staging Hosting preview is tested on direct routes, refresh, browser back, HTTPS, CSP/security headers and supported devices.
- [ ] Firebase billing plan and current pricing are reviewed; staging measured usage and expected launch traffic have an approved cost model.
- [ ] Budget/usage alerts, monitoring dashboard, escalation owners and an operational stop procedure are tested. Alerts are not treated as spend caps.
- [ ] Hosting, rules/indexes/backend rollback procedures are rehearsed separately; previous client/rules compatibility is known.
- [ ] Production release is explicitly approved; correct project verified by two people; no test data/secrets in release artifacts.

## Sign-Off

| Role | Name | Decision/date | Evidence or notes |
| --- | --- | --- | --- |
| Product owner |  |  |  |
| Security/Firebase owner |  |  |  |
| Moderation/safety owner |  |  |  |
| Release/deployment owner |  |  |  |
| Cost/billing owner |  |  |  |
