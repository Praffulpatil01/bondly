# Spark Cost and Limitations

## Budget Rule

This plan assumes **Firebase Spark only**, no Blaze, no paid API, no VPS and no paid AI. Do not enable billing. Prices, quotas and feature availability change; exact current plan limits were not independently verified during this audit. Before beta, the project owner must check Firebase's current official plan/pricing pages and the actual project Console. This document deliberately avoids quoting specific quota numbers or promising a zero-dollar total.

Official references to verify before approval:

- Firebase pricing plans: https://firebase.google.com/pricing
- Firebase project billing plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Anonymous Auth: https://firebase.google.com/docs/auth/web/anonymous-auth
- Firestore usage/quotas: https://firebase.google.com/docs/firestore/quotas
- Firestore TTL: https://firebase.google.com/docs/firestore/ttl
- Security Rules conditions/limits: https://firebase.google.com/docs/firestore/security/rules-conditions
- App Check: https://firebase.google.com/docs/app-check

## Service Fit Under the Constraint

| Firebase capability | Proposed beta use | Zero-budget/operational note |
| --- | --- | --- |
| Firebase Anonymous Authentication | Guest UID and Firebase Security Rules identity. | Anonymous provider is an existing Firebase Auth capability; verify current Spark limits, abuse protection and project settings. Anonymous UID is not a verified person, recoverable account or invitation. Account clearing creates identity loss. Avoid phone/SMS auth; it is metered and not needed. |
| Cloud Firestore | Minimal profiles, private match intents/state, proposed chats, consents, text messages, blocks and reports. | Spark has bounded no-cost usage; reads, writes, stored data and egress consume quota. Realtime listeners produce reads as documents are initially read/updated and on reconnect. On no-billing plan, quota exhaustion can cause service failures rather than overage billing, but this still breaks the beta. Check current limits by region/project. |
| Firestore Security Rules | Access control, schema validation and session expiry gate. | Rules are included with Firestore, but not a compute/matching service. Rule `get()`/`exists()` calls have access-call limits and may incur reads according to current billing behavior. Rules cannot throttle authorized users, choose a random candidate, inspect message semantics, or run jobs. |
| Firebase Hosting | Static Vite SPA, deep-route rewrite. | Can be suitable for a small beta within current Spark quotas. Transfer/storage limits apply; verify current terms. It does not host trusted app server logic. |
| Firebase Console | Manual beta approval, pairing, report review and cleanup. | No separate per-action backend service is introduced; administrative labor is the cost. Admin access bypasses Firestore Rules and must be highly restricted, MFA-protected and audited. |
| Firebase App Check | Optional additional signal against unauthorized app clients. | Do not treat it as user allowlisting or rate limiting. Verify provider requirements, current cost and Spark availability before adding. Existing app does not configure it. |
| Cloud Functions / Cloud Run / Scheduler | Not used in this strict plan. | Excluded. Trusted automated matching, moderation notifications, server rate limiting and scheduled cleanup would require a separately approved trusted backend; Cloud Functions deployment generally requires Blaze. Do not enable Blaze. |
| Firestore TTL | Not assumed. | Verify whether current TTL setup is available on Spark, any billing prerequisites/charges, deletion timing, and nested message behavior before relying on it. TTL is not a contractual instant-delete mechanism. |
| Firebase Storage | Not used; no avatar/chat media in MVP. | Excluded to avoid additional bucket/quota/billing uncertainty. No image sharing in required scope. |
| SMS, paid captcha, AI moderation, push vendor, analytics vendor | Not used. | Excluded. Any future use needs product/privacy review and explicit cost approval. |

## Expected Usage Drivers

- Auth: one anonymous user creation per tester identity. Repeated storage clearing can create more Auth users; allowlisting prevents them from using Firestore but does not throttle Auth creation.
- Firestore: each match intent, operator assignment, room/consent transition, message, report and block is a write. Each listener/query/read and message delivery/reconnect consumes reads. Rule lookups for beta membership and bilateral blocks add rule document access.
- Storage/egress: each text message is stored and delivered to participants; long retention increases storage and report evidence increases data lifecycle obligations.
- Hosting: static bundle and image/font downloads. Existing UI references third-party fonts/images; external dependencies can create availability/privacy concerns even if not directly billed by Firebase.

A rough resource model (not a price quote):

```text
Firestore writes/session = intent create + cancellation/assignment state changes
  + proposed room + up to two consent writes + room activation/end
  + messages sent + reports/blocks

Firestore reads/session = own profile/access + own intent/state listeners
  + chat metadata + message initial load + message listener deliveries
  + reconnect refetches + rule access checks

Monthly Firebase charge under Spark = $0 only while the project remains on Spark
  and each service stays within then-current free plan allowances.
Monthly operational availability is not guaranteed at $0 if quotas are exhausted.
```

Do not extrapolate 20–50 people as automatically within all quotas. Measure a representative beta session in staging, including multiple reconnects and operator views, then compare the observed usage to current Console limits with headroom.

## Unavoidable Limitations Without a Trusted Backend

1. **No safe autonomous matcher:** client-side selection requires exposing candidates or giving clients authority to claim/create pairings. Rules can validate writes but cannot execute opaque random/interest selection. Use manual pairing for this small beta.
2. **No robust rate limit:** Rules cannot count a user's writes over time or prevent a valid anonymous guest from rapidly creating/cancelling intents or reports. Manual allowlist reduces audience, not abuse by an approved user.
3. **No automated moderation:** reports can be stored and manually reviewed in Console; no automatic triage, notification SLA, harmful-content detection, or emergency response is available.
4. **No guaranteed immediate physical deletion:** Rules can block reads after expiry; Console cleanup is manual. TTL availability/latency/charges and recursive subcollection behavior must be confirmed. Do not call messages ephemeral.
5. **No reliable disconnect presence:** closing a browser does not guarantee a final write. Fixed `expiresAt` prevents indefinite chat access, but peer notice and queue cleanup may be delayed.
6. **No verified tester identity or age:** Anonymous Auth UID is pseudonymous only. A manual UID allowlist can restrict Firestore access to selected identities, but cannot independently establish age or real-world identity.
7. **No automatic operator boundary:** Console is privileged and bypasses Rules. Operator mistakes, compromised account, or missing coverage can expose or mispair data.

## Cost/Launch Gate

- Do not enable Blaze to “see if free tier is enough.” Do not add Cloud Functions, scheduled functions, Storage, SMS, paid App Check provider or external paid API.
- Owner checks current official Spark terms and records current project Console quotas before inviting testers.
- Set a conservative beta cohort, message/session guidance and operational stop trigger. Firebase alerts/usage dashboards are monitoring, not a guarantee of capped usage.
- If Spark limits or required policy fail, pause beta or reduce scope; do not silently enable billing.
- If the owner later requires instant automated matching or server-side abuse controls, obtain explicit approval for a paid-plan review and redesign. That change is outside this ₹0 plan.
