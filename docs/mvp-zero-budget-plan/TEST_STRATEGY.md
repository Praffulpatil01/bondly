# Test Strategy

The repo currently has no tests, test script, Emulator Suite configuration, or Firestore index file. The previously passing Vite/TypeScript build does not validate auth, rules, matching, or chat. This document proposes test coverage; no tests are implemented or run here.

## Environments

- **Rules unit/integration:** Firebase Auth + Firestore Emulator Suite with synthetic anonymous users and approved test allowlist records.
- **Operator workflow:** separate staging Firebase project, restricted to test users and operators; Console-created pairing records only. Never test allowlist bypasses or abuse payloads on production.
- **UI:** browser contexts representing independent Firebase UIDs, plus actual iOS/Android mobile browser checks where available.
- **Evidence:** candidate SHA, emulator/staging version, sanitized logs, steps, pass/fail, and owner. Never capture Auth tokens, env values, real report details, or private credentials.

## Required Negative Security Matrix

| ID | Attack/test | Expected result |
| --- | --- | --- |
| S-01 | Signed-out or non-allowlisted user reads/writes profiles, intents, match state, chats, messages, blocks or reports. | Denied. Public landing/Auth only; `localStorage` changes have no effect. |
| S-02 | User A reads/lists User B's queue intent or match-state document, including by guessed UID/session ID. | Denied; A can access only its own paths. |
| S-03 | User A creates/updates/deletes User B's profile or changes immutable UID/creation fields. | Denied. |
| S-04 | Client changes own intent status to matched, extends expiry, rewrites interests after joining, reactivates cancelled/expired session or reuses old session ID. | Denied; only allowed owner cancellation is accepted. |
| S-05 | Client creates arbitrary chat, injects a third participant, changes participants/expiry, or navigates to a guessed chat ID. | Creation denied; guessed ID provides no access. |
| S-06 | Participant forges `senderUid`, adds arbitrary fields, submits non-string/oversized text, edits/deletes message or sends after end/expiry. | Denied. Valid own bounded text only. |
| S-07 | Unrelated User C reads chat metadata, consent, message history or report from A/B. | Denied. |
| S-08 | User A accepts for B, changes B consent, activates without both acceptances, or reverses their own declined choice. | Denied. Room remains non-active; messages unavailable. |
| S-09 | User forges reporter UID, targets self/nonparticipant, references nonexistent chat/message, edits review state, lists reports or reads another reporter's record. | Denied; valid participant report is append-only and private. |
| S-10 | User A writes/reads B's block record, or attempts chat read/write/activation despite either-direction block. | Block path access denied; chat denied. |
| S-11 | Client creates a notification, legacy queue item, friendship, permanent chat or other out-of-scope document through MVP routes. | Denied by MVP rules. |
| S-12 | Test expired/cancelled intent and stale operator match state; attempt to accept stale room, post-expiry read/write, or reuse generation. | Denied based on authoritative expiry/state; old intent cannot be revived. |

Rules must be compiled and tests run in Emulator Suite. Firebase Console operations bypass rules and require a separate operator checklist/test; do not misrepresent Console-admin behavior as rules-enforced.

## Functional Integration Scenarios

### Guest and Beta Access

1. Fresh browser obtains Anonymous Auth UID; no email/password form is required.
2. Non-allowlisted guest sees pending-access state and cannot access Firestore MVP data.
3. Operator creates only that UID's beta record; guest reloads and becomes enabled.
4. Clear browser storage or sign out; verify a new UID is denied until separately approved.
5. Spoof demo/localStorage keys and route state; no access is granted.

### Interest and Intent

- Choose random and interest modes, persist interests, refresh, submit and cancel.
- Invalid/duplicate/oversized interest IDs, empty list, unknown mode and stale session fail validation.
- Create a new session after cancel; old one remains terminal and cannot be changed to waiting.
- User sees only own intent and private match state.

### Manual Match and Consent

- Operator pairs two waiting users in random mode; then separately test qualifying shared-interest pairing.
- Try no-interest-overlap, expired intent, already assigned user, existing block in either direction, disabled allowlist, and a third participant.
- Each guest receives own proposed state; no message read/write before both accept.
- Each accepts; valid active transition succeeds once. One declines; active transition and sends fail.
- Stale or mismatched chat ID/UID written by operator is caught by operator checklist and test validation.

### Realtime Chat and Lifecycle

- Two independent browser contexts exchange text; verify persisted order and both snapshots.
- Reload/reconnect and confirm history/state recovery with no duplicate messages.
- Disconnect, Next Stranger, decline, timeout, browser close and network interruption; verify end state and correct destination.
- Test around `expiresAt` boundary, device clock skew, double taps, retries and listeners unmounting.
- Verify no further reads/writes after end/expiry; physical deletion is tested separately from access denial.

### Block, Report, and Retention

- A blocks B; both users attempt current room reads/writes, consent, new pairing and re-entry. Repeat with inverse block.
- Submit valid reports with all approved reasons; test duplicate/rapid submissions and invalid chat/target IDs.
- Operator can find/review a report via Console; ordinary users cannot list or inspect reports. Verify moderator response process using a tabletop exercise.
- Execute manual cleanup runbook on staging, including messages under chat subcollections, and verify exact user-facing retention claim.

## Abuse and Operational Tests

- Anonymous UID churn and nonallowlisted traffic do not access Firestore data; monitor Auth abuse.
- Approved user rapid session creation, cancellation, reconnect loops, high-volume reads/messages/reports are monitored. Rules do not provide rate limiting, so confirm manual stop/escalation process and free-quota headroom.
- Verify no client can discover queue IDs/interests of other users; verify App Check, if used, is treated only as an additional signal and does not replace rules/allowlisting.
- Verify operator console access is restricted, MFA enabled, and pairing/report/cleanup actions are recorded.

## UI and Build Tests

- Manual viewport checks at narrow phone widths (320/360/390px), common Android/iOS viewport, tablet, laptop and wide desktop; include virtual keyboard and safe-area behavior.
- Check consent, composer, timer, Next Stranger, disconnect, report, block, waiting, pending access, empty, network failure, expired and reconnect states.
- Keyboard, focus, accessible labels, screen-reader status announcements, contrast, zoom and reduced-motion checks.
- Clean install/build: `npm ci`, then `npm run build`; build is not a substitute for the tests above. No `npm test` command currently exists; adding test infrastructure is a separately approved implementation task.

## Beta Exit Criteria

- All negative security tests pass and all expected allows succeed.
- Every required guest, interest, manual pairing, consent, messaging, end/next, block/report, reconnect and cleanup case passes in staging.
- No unresolved P0/P1 issue; moderation and cleanup owners are on duty for launch window.
- Mobile browser checks pass and privacy copy is accurate.
- Current Spark terms/quotas and observed staging usage are reviewed; beta cohort and stop procedure approved.
