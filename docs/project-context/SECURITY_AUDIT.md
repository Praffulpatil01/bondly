# Security Audit

This is a source-level review of the client and checked-in Firestore rules. It is not a penetration test and does not establish which rules are deployed. Environment values and credentials were not opened or reproduced.

## High-Priority Findings

### 1. Matchmaking queue allows any authenticated user to read/write every queue document

`firestore.rules` grants `read, write` on each `matchmaking_queue/{userId}` document to any signed-in user, without checking that the path UID matches `request.auth.uid`. A malicious authenticated client can inspect queue identities/status, overwrite another user's queue record, or delete it. Matching depends on this collection for discovery, so closing the rule requires a trusted matching design rather than a client-only rule tweak.

### 2. User and profile documents are readable by every authenticated user

Rules allow any authenticated user to read all `users/{uid}` and `profiles/{uid}` documents. Records include email addresses and potentially bio, online status, last-seen, and other profile data. This is broader than UI promises of hidden identities and friend-only information. Separate private account data from public profile data and authorize profile fields deliberately.

### 3. Chat creation is under-validated

Rules allow any authenticated user to create any `chats` or `permanent_chats` document without validating participant count, participant identity, allowed fields, or creator membership. Participant checks protect some subsequent reads/updates, but client-controlled room creation can still create forged/unusable records. Permanent-chat read also includes `resource == null`, which can permit reads of nonexistent document paths; verify exact intended behavior in the Firebase Rules Emulator before deployment.

### 4. Message payload identity and content are not validated

Nested message create rules verify only that the authenticated user is a chat participant. They do not require `senderId == request.auth.uid`, bound text size/type, validate timestamp/content fields, or prevent arbitrary field payloads. Participants can spoof message senders or write oversized/unexpected data. Permanent message updates likewise lack field-level validation.

### 5. Client can create notifications for arbitrary recipients

`notifications/{id}` allows any authenticated user to create a notification with arbitrary recipient/sender/type/content. This enables spoofing and notification spam. Notification creation should be authorized against the underlying action and preferably performed by trusted backend logic.

## Additional Rule and Workflow Risks

- Friendships can be created by any signed-in user if their UID is present in the submitted `users` array. The rule does not require exactly two distinct users or a valid accepted request. Any current participant can update/delete the entire friendship record; fields such as users/status/blocker are not constrained.
- Friend-request create checks the sender UID field but does not validate recipient, allowed fields, pending status, or relationship state. The recipient can update any fields, not just response status. Rules include legacy and current field names, widening ambiguity.
- Chat update checks current participants but does not constrain what fields a participant can change. Message reads use parent participant checks, but parent participant lists are client-created.
- Blocked status is not enforced by matching, messaging, or profile-read rules. Blocking is not a security boundary.
- Anonymous users are not currently used, but route guards trust any truthy `Ryple_demo_user` local-storage value. Client state is not authentication and must never authorize backend access. Firebase rules still require real `request.auth` for protected data.
- Client-only matching has no trusted queue lease, expiry, abuse throttling, or server eligibility checks. Queue entries are only cleaned up along selected client paths; cancel navigation does not immediately remove the record.
- Client stores anonymous messages and does not delete them when the timer expires, contrary to Safety Center/FAQ copy. Retention and deletion are neither implemented nor backed by policy in this repo.
- Profile documents duplicate email and other fields. Publicly readable user documents increase exposure; use least-data public profile documents.
- There is no report collection or report backend. A client toast can claim success without any record reaching moderators.
- `firebase.json` does not configure Storage rules or Cloud Functions. Storage/Functions wrappers are not deployed security policies.
- `.env.development`, `.env.production`, and `.firebaserc` are tracked in Git. Their values were intentionally not inspected or disclosed. Firebase browser config values prefixed `VITE_` are delivered to client code and must not be treated as server secrets. Review repository history and restrict/rotate any accidentally included privileged credentials; use Firebase API key restrictions and rules for security.

## Credentials and Environment

The app validates required Firebase client configuration at startup in `src/config/env.ts`; Vite-prefixed variables are bundled into browser code. No service-account key or private credential was confirmed because config values were not opened. A Firebase web API key is normally an identifier, not an authorization boundary; the critical controls are restrictive Auth, Firestore, Storage, and backend policies.

## Recommended Remediation Order

1. Review and deploy least-privilege Firestore rules; test positive and negative access in Firebase Emulator Suite. Rules, not UI checks, are the authority.
2. Move sensitive matching and trust-sensitive writes to a trusted server/Cloud Function boundary; add queue TTL, rate limits, atomicity, and abuse controls.
3. Validate document schemas, path IDs, participant lists, ownership, message sender IDs, text size, status transitions, and immutable fields in rules/backend.
4. Define and implement actual report/block workflows. Enforce blocks in matching, chat access, profile discovery, and requests. Do not claim submission before persistence.
5. Decide anonymous-chat retention, implement cleanup/expiry, and correct conflicting privacy statements.
6. Minimize profile fields and split public profile from private account data; document retention and access.
7. Audit Git history and hosting/provider settings for tracked env material; rotate any privileged secret if one was committed. Do not put private credentials in `VITE_*` variables.
8. Add automated security/rules tests and monitor abuse and operational errors before broad release.

See [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) for collection shapes and [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md) for sequencing.
