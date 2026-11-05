# Zero-Budget MVP Implementation Plan

Planning only; source, dependencies, lockfile, Firebase rules/indexes and production config are unchanged. Each phase should be implemented and verified independently after explicit approval. The manual pairing alternative is chosen to keep the beta within a no-Blaze design; backend automation is out of scope.

## Phase 0: Product, Operations, and Security Decisions

**Existing files to review:** `docs/project-context/*`, `docs/release/*`, `firestore.rules`, `firebase.json`, `src/main.tsx`, `src/config/env.ts`.

**New docs/runbooks:** This plan plus moderator procedure, retention/privacy statement and invite/consent copy, owned by product/security operator.

**Data changes:** None.

**Security implications:** Decide who can approve UIDs, review reports, access Firebase Console, and perform data cleanup. Confirm random/interest overlap and whether proposed chat requires both parties' specific acceptance.

**Acceptance:** Product owner approves Bondly/Ryple name, 20–50 cohort, matching response window, minimum age, interest fallback, timer, report SLA, block meaning, retention/deletion deadlines, and named operator(s). Strict no-Blaze and no paid API constraints are recorded.

**Tests:** Tabletop abuse/report/retention incident exercise; review current Firebase Spark project eligibility and limits from official docs/Console.

**Rollback:** No code or project impact. Stop if no moderation/cleanup owner or if instant automated matching is mandatory.

## Phase 1: Guest Auth and Private Beta Gate

**Existing files:** `src/services/firebase/auth.ts`, `src/firebase/auth.ts`, `src/context/AuthContext.tsx`, `src/components/auth/{GuestRoute,ProtectedRoute}.tsx`, `src/main.tsx`, `src/config/{env,firebase}.ts`.

**New files:** Proposed `src/features/beta/...` onboarding/pending-access components if existing page structure cannot host these cleanly; emulator tests/config in an approved test path.

**Data changes:** Add `beta_access/{uid}` managed manually by trusted operator. Add minimal `beta_profiles/{uid}`. Do not write email to profile. Do not migrate old user data yet.

**Security implications:** Anonymous Auth is a real identity, but not a verified person. Firestore Rules must gate all beta data on Auth plus own enabled allowlist record. Remove localStorage demo acceptance from beta routes; old feature code stays in repository.

**Acceptance:** Fresh visitor obtains Anonymous Auth UID; pending user can see only their own UID/access status; operator allowlisting unlocks beta routes; logout/localStorage spoof does not grant Firestore access; refresh behavior is documented. Clearing browser data yields reapproval, as designed.

**Tests:** Auth Emulator: create/restore/sign-out; rules tests for absent/disabled/expired allowlist; localStorage forgery; own-vs-other beta document access.

**Rollback:** Revert beta route guard entry point and keep existing routes/features; do not delete old users/profiles. Revoke allowlist records manually. Ensure rollback does not reopen broad current rules.

## Phase 2: Interest Onboarding and Private Match Intent

**Existing files:** `src/features/onboarding/pages/OnboardingPage.tsx`, `src/features/dashboard/pages/DashboardPage.tsx`, `src/firebase/collections.ts`, `src/features/matching/pages/MatchSearchPage.tsx`.

**New files:** `src/features/matching/services/match-intent.service.ts` or equivalent; type definitions for approved intent/status schema; rules tests.

**Data changes:** Add top-level `match_intents/{sessionId}` with `ownerUid` and owner-filtered client reads, plus operator-managed `match_state/{uid}`. Add only chosen interests/nickname to `beta_profiles`. Do not use the legacy global `matchmaking_queue` for beta.

**Security implications:** Clients can write only their own waiting intent, cancel once, and read only their own state. They cannot enumerate queue, choose a peer, change state to matched, create a chat, or overwrite expiry. One intent generation is not reusable.

**Acceptance:** Interests persist after refresh; random and interest modes are explicit; invalid/empty values rejected; user can cancel and requeue with a fresh ID; no other user's interest/UID is queryable through the app.

**Tests:** Unit/schema validation and rules tests for valid/invalid interests, cross-user access, cancellation, expired session, state tampering, duplicate/reuse attempts.

**Rollback:** Keep legacy dashboard and matching modules untouched behind the beta route; stop accepting new intents and leave cleanup to operator. Do not remove legacy collections.

## Phase 3: Manual Pairing Console Procedure

**Existing files:** `src/features/matching/pages/MatchSearchPage.tsx`, `src/features/chat/pages/AnonymousChatPage.tsx`, `src/firebase/collections.ts`, `firestore.rules` (changes require approval).

**New files:** Proposed `src/features/matching/services/match-state.service.ts`, operator pairing runbook; no backend function.

**Data changes:** Operator creates proposed `chats/{chatId}` and writes each user's private `match_state/{uid}`. The proposed room has a consent deadline; start/expiry/report timestamps are set at mutual activation. Existing `/chats` path may be reused only after approved schema/rule compatibility review. No new server or billing resource.

**Security implications:** Only privileged Console user creates the room; client room create is denied. Operator must check allowlist, expiry, active assignment and both directions of block. Admin Console bypasses rules and is a highly trusted interface.

**Acceptance:** One documented operator can pair random or interest-compatible waiting guests; both clients receive only their own assignment; no third user can read room; no user can create/join arbitrary room. Pairing is auditable and clearly disclosed as manual.

**Tests:** Emulator tests prove client create denied; staging with two guest UIDs proves Console-created room is readable only by participants; invalid operator record checklist and pair conflict test.

**Rollback:** Operator stops assigning new rooms; mark pending states declined/ended through Console. Existing chat records remain and are handled under retention policy.

## Phase 4: Consent, Realtime Text Chat, Timer, and Lifecycle

**Existing files:** `src/features/chat/pages/AnonymousChatPage.tsx`, `src/features/chat/services/chat.service.ts`, `src/features/chat/components/{ChatHeader,MessageInput,MessageBubble}.tsx`, `src/features/matching/pages/MatchSearchPage.tsx`, `src/main.tsx`.

**New files:** Approved consent component/service and domain types if existing chat modules cannot host them; Firestore Rules Emulator tests.

**Data changes:** Add `chats/{chatId}/consents/{uid}` and align message fields to `senderUid`, bounded `text`, server `createdAt`. `expiresAt` immutable on room. No permanent chat or notification documents created by beta.

**Security implications:** Message writes bind sender UID to Auth. Chat create denied to clients. Both consents required before `active`; blocked users denied both-direction access; room expiry enforced in Rules. Firestore rules do not physically delete data or detect presence.

**Acceptance:** Both users accept before messaging; text messages stream in realtime and reconnect; forged sender/extra fields/oversized content fail; timer is based on server room expiry; Next Stranger ends old chat before fresh intent; Disconnect prevents further writes and returns safely; no messages after expiry.

**Tests:** Two-browser real-time sends; consent race/decline; unauthorized room/message; block; network/reconnect; Next/Disconnect; time-boundary; message ordering and listener cleanup.

**Rollback:** Disable new match entry and keep existing chat feature code. Do not restore old public queue access. Preserve data under agreed retention; no destructive migration.

## Phase 5: Block, Report, Retention, and Operator Review

**Existing files:** `src/features/chat/pages/AnonymousChatPage.tsx`, `src/features/chat/components/ChatHeader.tsx`, `src/features/settings/pages/{BlockedUsersPage,SafetyCenterPage}.tsx`, `src/types/notification.ts`, `firestore.rules`.

**New files:** Report form/service and `users/{uid}/blocks/{otherUid}` UI/service if existing controls cannot be reused; operator report/cleanup procedure; security tests.

**Data changes:** Add private block subcollection and append-only `reports/{reportId}`. No `notifications` creation; report reviews done via Console. Define whether report retains evidence separately from chat expiry.

**Security implications:** Report writes limited to the authenticated participant and a target in that chat; client cannot read others' reports or mutate review state. Blocks restrict chat rules and must be checked manually before pairing. No Rules-based rate limiting or moderator role is available without trusted backend/custom claims.

**Acceptance:** Block survives refresh and stops active/future interaction; report success only follows Firestore acknowledgement; operator sees report in Console; only operator handles resolution; expiry/access/deletion claims match written policy.

**Tests:** Forged reporter/target/chat, report enumeration, report mutation, block both directions, rematch bypass, repeated report volume, manual cleanup and subcollection deletion verification.

**Rollback:** Disable report/match entry if operator coverage is lost; keep blocks enforced. Do not delete reports during rollback; follow approved retention.

## Phase 6: Responsive Beta UX and Feature Isolation

**Existing files:** `src/main.tsx`, `src/styles/index.css`, `src/features/{landing,onboarding,matching,chat}`, `src/components/auth/*`, `index.html`.

**New files:** Only a beta route/layout or small state component where existing layout is unsuitable.

**Data changes:** None.

**Security implications:** Frontend route hiding is not authorization; rules remain authoritative. Do not expose email/profile data in anonymous chat. Remove unsupported privacy/safety claims from beta copy.

**Acceptance:** Mobile/desktop chat, match waiting, consent, report/block and error states work; screen labels/focus/reduced motion are checked. Permanent friendships, notifications, profile directory and other existing features remain in source but are not part of MVP entry navigation.

**Tests:** Manual viewport matrix, keyboard, screen reader smoke test, browser back/refresh, no localStorage-only auth.

**Rollback:** Revert route/layout CSS while keeping server rules restrictive. Existing feature modules remain intact.

## Phase 7: Private Beta Operations and Release Gate

**Existing files:** `firebase.json`, `firestore.rules`, `src/config/env.ts`, `vite.config.ts`, package scripts; no source changes planned for deployment stage itself.

**New files:** Approved Emulator Suite config/rules tests/index file only if required; operator runbooks, no secret-bearing tracked files.

**Data changes:** Manually seeded beta access; test chat/report docs in staging. No production schema rollout until approval.

**Security implications:** Separate staging/production projects; no Blaze; operator Console IAM/MFA. Existing `.env.development`, `.env.production`, `.firebaserc` are tracked—review securely without printing values and audit history. If production is later deployed, explicit approval required.

**Acceptance:** Emulator security suite and staging two-user flow pass; clean build; privacy, moderator coverage, manual cleanup, cost and incident owner signed. No production deployment in this phase.

**Tests:** `npm ci`, `npm run build`, emulator security matrix, two-user staging, responsive checks, quota dashboard review, rollback tabletop.

**Rollback:** Stop new beta invitations and matching; revoke beta access docs; mark rooms ended; retain/delete data by policy; previous Hosting version only if compatible with restrictive rules.

## Deferred / Separate Approval

Autonomous instant matching, Cloud Functions, Cloud Scheduler, account linking, email/Google auth, permanent friendship chats, media upload, push notifications, analytics, PWA, and any paid service are out of scope. Any Blaze enablement, third-party vendor, production rules/index change, data migration, or deployment requires explicit approval.
