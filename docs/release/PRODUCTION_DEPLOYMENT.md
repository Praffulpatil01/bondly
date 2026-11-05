# Production Deployment Plan

**No deployment is authorized by this document.** The current repository config points at Firebase Hosting and Firestore rules, but actual staging/production project IDs, billing state, provider configuration, indexes, and deployed rules were not inspected. Keep all identifiers/credential values out of this document.

## Environments

1. **Local/emulator:** Firebase Auth and Firestore Emulator Suite with synthetic data; add emulator config only after approval. No real user data or production credentials.
2. **Staging:** a dedicated Firebase project, separate from production, with anonymous Auth enabled, approved indexes/rules, trusted backend if selected, and Hosting preview/site. Use synthetic data and separate Vite client configuration.
3. **Production:** distinct Firebase project, distinct environment injection and deploy identity, domain/provider restrictions, alerts and monitored release. Production configuration/rules remain unchanged until explicit approval.

Do not promote a staging `.env` file or reuse a Firebase project between environments. Supply `VITE_FIREBASE_*` at build time through an approved local/CI secret/config mechanism. The Firebase web config is client-visible and is not an authorization secret; no service-account/private key belongs in `VITE_*`, source, build artifacts, or logs. Existing `.env.development` and `.env.production` are tracked in the repository: inspect them securely, audit history, and rotate any privileged secret found before launch. Do not print their values. `.firebaserc` is tracked; validate selected project identity before any deploy.

## Release Candidate Build

- Pin the release commit and record its SHA.
- Use the lockfile with `npm ci`; inject only staging config for staging build.
- Example after project configuration has been approved:

```sh
npm ci
VITE_APP_ENV=staging npm run build -- --mode staging
```

- Run rules/emulator and two-user integration suites before Hosting preview.
- Check generated artifact and browser network requests for production project IDs, test/demo fallbacks, source maps, and unintended external calls.
- Current scripts are `dev`, `build`, and `preview`; there is no test/deploy script. Do not add scripts/dependencies as part of this planning-only phase.

## Staging Deployment Sequence

Use Firebase CLI only from an approved workstation/CI identity. Placeholders below are not real project identifiers.

1. Confirm `firebase --version`, authenticated deploy identity, and selected staging project alias. Require a second-person review of the target.
2. Deploy staging Firestore indexes (once an approved `firestore.indexes.json` exists) and rules separately. Run T-SEC tests in emulators first. **Never send unapproved rule changes to production.**
3. Deploy trusted backend only after billing/security approval. Verify region, IAM, secrets, logs and limits.
4. Deploy a Hosting preview channel or staging site:

```sh
firebase hosting:channel:deploy mvp-rc --project <STAGING_PROJECT_ID>
```

or deploy the staging Hosting target/site after verifying configuration:

```sh
firebase deploy --only hosting --project <STAGING_PROJECT_ID>
```

5. Run direct-route, auth, two-guest match/chat, report/block, mobile and rollback smoke checks against staging.
6. Record rules/index/backend versions, build SHA, preview URL (in the release record, not source), test evidence, error rate and cost measurements.

The repository currently has a Hosting SPA rewrite but no configured security headers, environment-specific Firebase targets, Firestore index file, Functions source, or emulator project config. Add and test those only with approval. CSP must account for the existing Google Fonts, Material Symbols, remote avatar and Dicebear requests; prefer removing external dependencies only as an approved UI change.

## Production Go-Live Sequence

Production release is blocked until every readiness gate and checklist item is signed. Then, with explicit production approval:

1. Freeze and tag the exact candidate; verify clean working tree and reproducible build.
2. Confirm production Firebase project, billing state, Auth providers, allowed domains, support/moderation owner, rules/index versions, alert recipients, and rollback owner in a two-person check.
3. Deploy rules/indexes/backend in the approved order. Because current rules are unsafe, do not release client code against them; because changing rules can break old clients, coordinate compatibility and release order with a tested migration/maintenance plan.
4. Deploy Hosting, verify domain/TLS, SPA routes, security headers, source maps policy and runtime project identity.
5. Run a small controlled two-user production smoke only after rules pass; use designated test accounts and delete their test data per policy.
6. Monitor error/permission denials, queue age, match success, message delivery, report intake, abuse signals and Firestore/function/hosting usage.

## Firebase Cost and Zero-Budget Analysis

A strict zero-dollar guarantee is not established by this repository or Firebase configuration. Firebase free/no-cost quotas are bounded and can be exhausted; on no-billing plans requests may be throttled or service unavailable, while Blaze usage can incur charges. Check current Firebase pricing/terms for the chosen project/region before approval because quotas and billing requirements change.

| Capability | MVP usage/cost driver | Plan note |
| --- | --- | --- |
| Firebase Authentication: anonymous/email/Google | User creation/sign-in and provider-specific limits. | Avoid phone/SMS auth; SMS is metered. Verify current limits for the chosen providers/project. |
| Cloud Firestore | Every profile/queue/message/report read/write, realtime listener delivery, rule `get()` reads, storage and egress. Matching query/listener fanout and reconnects are material. | No-cost quotas may cover a small pilot but do not guarantee uptime at zero cost. On Spark, quota exhaustion can stop operations; on Blaze, over-quota usage can bill. Measure staging reads/writes per session. |
| Firebase Hosting | Asset storage, transfer and requests. | Can fit within no-cost allowances for a small MVP; check current limits/custom-domain requirements and monitor transfer. |
| Cloud Functions for Firebase | Trusted matchmaking, reporting/moderation writes, validation and rate limits. | Deployment generally requires Blaze billing enabled. Free allowances may apply, but billing account is still required and cost is not guaranteed $0. This is the key conflict between security architecture and strict zero-budget. |
| Cloud Scheduler / scheduled cleanup | Timed queue and chat cleanup if implemented as scheduled Functions. | May require Blaze and can have separate per-job/usage pricing after applicable free allowance. Avoid adding until necessity and price are confirmed; consider TTL or request-time expiry, including TTL delete pricing. |
| Firebase Storage | Avatar/media uploads. | Excluded from MVP. Bucket/billing requirements have changed over time; verify current project-specific terms before adding. |
| AI moderation, paid captcha, SMS, push vendors | Moderation inference, identity verification, higher-tier bot protection, external messaging. | Excluded from MVP; require separate provider/security/cost review. |

### Usage Estimate Method

No reliable dollar estimate is possible without expected daily active guests, sessions per guest, matching retries, chat messages/session, listener reconnects, report volume, region, retention and current pricing. Estimate from staging measurements:

- `daily Firestore writes ≈ queue lifecycle writes + room transitions + messages + reports/blocks + profile/session updates`.
- `daily Firestore reads ≈ queue/query/listener deliveries + chat-message deliveries to participants + report/moderator reads + reconnect/refetch reads`.
- `monthly cost = metered reads/writes/storage/egress + Functions compute/invocations + any scheduler/storage/provider charges − currently applicable free allowances`.

Set usage alerts at staged thresholds and a written stop/review procedure. Budget alerts notify; they are not hard spending caps. If the owner rejects Blaze and requires a strict $0 ceiling, the trusted matching/report architecture must be redesigned and security-reviewed before launch; do not ship the current open client queue to preserve “free” operation.

## Rollback and Recovery

- **Hosting:** keep the previous known-good Hosting release and use Firebase Console Hosting release history to roll back to it. Verify the prior client remains compatible with currently deployed rules/backend before rollback.
- **Rules/indexes:** retain reviewed, versioned rule/index files and deploy a preapproved rollback version only after checking compatibility with current clients/data. Do not assume Hosting rollback restores rules.
- **Functions:** retain a tagged backend version and restore a known-good deployment with the same config/secrets; preserve logs for incident review.
- **Data:** do not roll back by destructive database restore without owner approval. Define export/backup and retention before launch; test recovery in staging.
- **Incident:** pause matching through a server-controlled feature flag or disable entry points; do not rely on client-only controls if the backend is compromised. Notify the product/security owner, preserve report evidence, and follow the privacy incident process.

## Monitoring and Cost Controls

Monitor Firebase Auth sign-in failures/anonymous account creation, Firestore usage and permission errors, Functions errors/latency/invocations if deployed, Hosting traffic, queue age/stale records, match success/timeout, disconnect rate, report intake/review SLA, and block violations. Assign named owners and escalation thresholds before opening public access. Avoid logging message contents, auth tokens, email, or report text unless a reviewed retention/access policy explicitly requires it.
