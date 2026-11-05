# Spark-Compatible Matching Design

## Decision: Manual Pairing for Private Beta

For strict ₹0 and no Blaze, use **operator-mediated matching** for 20–50 explicitly invited testers. Do not reuse the current client-side `MatchmakingService.simulateSearch()` in beta. It reads arbitrary queue rows and writes rooms/participant lists from the browser; current rules permit any authenticated client to read/write the queue. Tightening those rules while keeping client discovery would either break the flow or expose other testers' queue data.

The operator uses Firebase Console as the trusted actor, selects candidates from private intent records, and creates real Firestore chat documents. This is manual backend administration, not mocked chat data. It is slow and labor-intensive; beta users must be told matching can be delayed.

## Two Match Modes

- **Random:** Operator chooses a random eligible pairing from currently waiting users. Selection should use a documented neutral process, for example random draw from the current eligible set. Do not claim algorithmic or cryptographic fairness.
- **Interests:** Operator selects users who meet the approved overlap rule (e.g. at least one common interest ID). If no overlap exists, keep users waiting or offer an explicit opt-in to random mode. Never silently fallback.

The operator can see queue interest choices in Firebase Console. This is personal preference data; limit operator access and disclose that beta matching is manually facilitated.

## State Machine

```text
Auth guest
  -> beta access pending
  -> allowlisted
  -> onboarding (nickname + interests)
  -> idle
  -> intent waiting (random | interests)
  -> operator selects eligible pair and creates proposed room
  -> match_state points each user to proposal
  -> both participants accept
      -> active chat -> Next Stranger / Disconnect / expiry -> ended
      -> either declines -> declined -> operator clears assignment
```

Each match intent uses a new `sessionId`; terminal/cancelled/expired entries are never revived. Users read only their own intent and `match_state`. No client lists or queries other users' waiting intents. The operator uses Firebase Console to inspect intents.

## Manual Handshake

1. Guest signs in with Anonymous Auth and shares their UID for beta approval. An operator adds the UID to `beta_access` through Firebase Console.
2. The user submits mode/interests into a new top-level `match_intents/{sessionId}` document with `ownerUid` set to their own UID. Rules permit owner reads (including only owner-filtered list queries) and one-way cancellation; no client can set `assigned`.
3. Operator checks both intents are current, users are not already assigned, both are beta-enabled, and neither user has blocked the other. For interest mode, check the selected overlap rule.
4. Operator creates `chats/{chatId}` with status `proposed`, exactly two participant UIDs, creation time and consent deadline; operator writes a private `match_state/{uid}` to both participants with that `chatId`.
5. Each app listens only to its own state and loads the proposed chat if its UID is a participant. It shows a consent screen without revealing real identity.
6. Each participant creates exactly one consent document under their own UID. No message access exists until both consent.
7. A participant client may transition proposed to active only when rules validate both `accepted` records in `getAfter`; the second accepter sets `startedAt`, `expiresAt`, and `reportUntil` within approved bounds. If this atomic rule or timestamp arithmetic is too complex or fails tests, operator activates the room only after manually confirming both accepted (more operator work), or defer matching until a trusted backend is approved.
8. A decline leaves the room non-active; app and operator close the assignment. No messages can be sent in declined state.

The consent step protects against being silently forced into a particular pair by the operator. Users already consent to be discoverable by choosing a match intent, then consent to the actual proposed chat.

## Next Stranger, Disconnect, Expiry

- **Next Stranger:** Client requests end of current room (allowed participant state transition), closes listeners, creates a fresh intent only after end succeeds, and returns to waiting. Operator pairs again.
- **Disconnect:** Ends/left status for the current participant and returns to the dashboard. The peer sees a disconnected state. Define whether one user ending the room ends it for both; recommended: yes, immediately, with no further message writes.
- **App/tab loss:** No reliable server presence or on-disconnect hook is available in this design. Room expiry provides a hard stop; operator handles stale waiting/assignment records. UI must not promise instant detection.
- **Timer:** the proposed room has a consent deadline. `startedAt`, `expiresAt`, and the report window are fixed at mutual activation; the client countdown is cosmetic. Rules reject message access/write once `request.time >= expiresAt`. Test duration arithmetic, boundary conditions and device clock skew.
- **Queue cleanup:** Client can cancel own pending intent; operator manually clears old intents/match states. Time-based read/write denial is not physical deletion. Do not add scheduled Functions/Cloud Scheduler under the no-Blaze rule.

## Why Not Client-Only Automatic Matching?

A viable client matcher needs a discoverable candidate set. Firestore Rules are not a query engine that can privately return selected fields: if a guest can read queue documents, they can inspect the fields returned for those documents. A public candidate pool exposes at least identifiers or pseudonymous tokens, selected interests, queue times and availability to other beta clients. If clients can create the room or claim another person's queue entry, a modified client can bypass the UI, race multiple matches, or forge pairings unless rules implement a complex mutual handshake and one-use state machine.

Rules can validate documents and participants; they cannot execute the selection, maintain a global lock, enforce a per-user request rate, or perform scheduled cleanup. A client-only token/lease design may reduce accidental races, but it does not provide a trusted matchmaker or abuse throttling. It is not recommended as the default for this release.

## Operational Requirements and Limits

- Designate one or more trained beta operators, give Firebase Console access only to those operators, require MFA, and keep a pairing log with timestamps and decisions. Never share broad project-owner credentials with testers.
- Set a matching service window and response expectation (for example, disclose that pairings are manually reviewed rather than instant; choose actual SLA with the owner).
- Operators must check blocks and active assignments before every pair; Console bypasses Firestore Rules.
- This process is limited to the invited cohort and requires manual report review. No operator coverage means no report promise and no beta launch.
- If instant automated matching or larger-scale operation is a requirement, pause this plan and obtain approval for a trusted backend/billing approach. Do not silently restore global queue reads or enable Blaze.
