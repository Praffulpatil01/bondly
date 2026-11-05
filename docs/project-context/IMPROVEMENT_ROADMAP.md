# Improvement Roadmap

This is a recommendation, not an implementation plan already authorized for execution. No application changes were made in this audit.

## 0. Product Decisions and Baseline

- Confirm Bondly vs Ryple; align repository, app title, copy, support identity, and design references.
- Agree on the product promise: registered identity vs anonymous session, match duration/criteria, retention, profile visibility, and what “AI-powered” means or whether to remove that claim.
- Establish a staging Firebase project and repeatable emulator/test access. Document owner-controlled environment setup without committing secrets.
- Add a verified behavioral baseline for auth, onboarding, queue matching, chat, friendship, notifications, and settings.

**Dependencies:** product-owner decisions and Firebase project access. **Risk:** implementing against contradictory marketing copy and current schema can cement the wrong user/privacy model.

## 1. Security and Trust Foundations (P0)

- Rewrite and test Firestore rules using least privilege; stop global profile/queue access, validate ownership/participant membership, constrain writes and status transitions, and restrict notifications/friendships.
- Move sensitive matching and trust-sensitive writes to a trusted server/Cloud Function boundary; add rate limiting, queue leases/expiry, abuse controls, and atomic friend-request acceptance.
- Define report and block data models and moderation workflow; make enforcement effective in queue selection, messages, reads, and profile visibility.
- Decide anonymous-chat retention, implement deterministic expiry/deletion, and fix all privacy statements to match actual behavior.
- Review Git history for tracked environment material and rotate any privileged values found there.

**Dependencies:** threat model, schema compatibility plan, Firebase Emulator Suite. **Risk:** changing rules before adjusting client access may break live workflows; stage and test positive/negative cases.

## 2. Core Journey Reliability (P1)

- Make authentication states explicit (registered, anonymous, demo) and remove local-storage flags as an authorization surrogate.
- Make onboarding persistence/validation consistent for every supported session type; implement photo selection/upload only after Storage rules are defined.
- Pass selected vibe/interests/language into a server-controlled matcher; add transaction-safe matching, self-match prevention, eligibility/block filters, cancellation, stale queue cleanup, and retry semantics.
- Make chat lifecycle authoritative and consistent: one timer source/duration, explicit skip/disconnect/timeout transitions, listener cleanup, and documented retention.
- Make mutual friend acceptance and permanent-chat setup atomic/idempotent; keep route IDs and friendship/chat IDs unambiguous.
- Implement online presence with an appropriate trusted/realtime design rather than only auth-event writes.

**Dependencies:** P0 security/data decisions. **Risk:** schema or route changes affect queue/chat documents and existing users; include compatibility/migration planning if live data exists.

## 3. Complete Feature Semantics (P1/P2)

- Implement real reporting, blocking, privacy preferences, notification preferences, password reset, and support submissions or remove claims/controls until available.
- Fix notification visibility/filter semantics and place subscription ownership at a lifecycle that keeps the badge accurate.
- Add observable error/retry states for listeners and writes; replace swallowed errors and optimistic success claims.
- Remove dead/mock components and fixed demo data from production paths; keep any demo isolated from real service assumptions.

**Dependencies:** verified service/API contracts and moderation/support ownership. **Risk:** safety-related UI that looks operational but is not backend-connected can create user harm and compliance exposure.

## 4. Architecture and Maintainability (P2)

- Consolidate Firebase initialization and service ownership; deliberately remove or adopt the unused generalized service layer.
- Consolidate runtime document types with Firestore schemas/rules; add schema validation at boundaries.
- Define ownership boundaries for state, data fetching, listener lifecycle, error handling, and timestamps.
- Audit direct Firestore calls in pages and replace duplicated profile joins/updates with cohesive service functions.
- Add explicit React/React DOM dependencies to the manifest in a separately approved dependency change; currently they resolve only as peers.
- Decide whether unused dependencies/tooling are needed; add real lint/test configuration and CI gates instead of carrying unconnected packages.

**Dependencies:** workflow tests and rules/backend architecture. **Risk:** touching live data shapes without migration or contract tests.

## 5. Premium UI/UX and Accessibility (P2/P3)

- After product behavior is stable, define a consistent visual direction and token system, reduce competing palette/utility overrides, and settle the brand.
- Design around real matching/chat states and user trust; remove unsupported AI, deletion, verification, live stats, and support claims.
- Complete mobile-first interaction specs for chat keyboard/viewport, timer, skip, friend consent, reporting, blocking, empty/error states, and desktop adaptation.
- Implement semantic controls, keyboard access, focus states, contrast checks, reduced-motion support, and accessible status announcements.
- Replace brittle remote avatar crops with owned assets and robust fallbacks; verify legal/operational suitability of external image/font services.
- Run browser testing at target viewports and automate visual/accessibility checks.

**Dependencies:** approved user flows, brand, and real data states. **Risk:** visual redesign cannot compensate for unreliable or insecure core behaviors.

## 6. Performance, Release, and Operations (P2/P3)

- Split the current large client bundle and analyze route-level imports; build reports an approximately 1 MB minified chunk.
- Resolve Vite `__dirname` warning and ineffective dynamic imports.
- Add error boundaries, structured logging/monitoring, product analytics only with a reviewed privacy policy, and release diagnostics.
- Configure Hosting preview/release workflow, Firestore indexes/rules deployment, rollback, backups/retention, and incident ownership.
- Decide whether PWA/offline support is a real requirement before using the currently unused PWA packages.

## Suggested Order

Product and retention decisions → rules/security tests → trusted matching/reporting architecture → auth/onboarding and core journey correctness → chat lifecycle and friendships → notification/settings semantics → test/CI/observability → UI redesign and accessibility → performance/release hardening.

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) and [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md) for the findings driving this sequence.
