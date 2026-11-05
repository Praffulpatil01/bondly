# Project Overview

## Product

Bondly is the repository name, but the running React application identifies itself as **Ryple** throughout its page copy, configuration, local-storage keys, support address, and browser title. The standalone design reference uses Bondly. This branding mismatch is verified in source; this audit does not assume which name is final.

The current concept is a social discovery service for Gen Z: choose a conversation theme, meet a stranger for a short anonymous conversation, and optionally become friends. Landing copy describes a ten-minute session and promotes “AI-powered” matching, but neither AI-based matching nor a production-ready anonymous-user journey is implemented in the inspected code.

## Intended Audience and Problem

The interface explicitly targets Gen Z and frames the problem as meeting people without profile-first judgment or conventional social-feed pressure. The intended experience favors a topic-led conversation that can develop into an ongoing friendship. These are product claims in UI copy, not evidence of adoption, user research, or a deployed service.

## Current Product Vision

The current vision expressed by the app is “no profile, no judgment, just conversation,” supported by topic/vibe selection, timed chat, mutual friend requests, and permanent chats. The implementation stores anonymous-chat messages in Firestore and does not implement AI moderation, so some marketing and safety statements exceed the behavior verified in source.

## Current Features

- Landing, login, signup, onboarding, dashboard, matching, anonymous-chat, and time-up pages.
- Email/password and Google popup authentication through Firebase Authentication.
- User and profile documents in Firestore; interest/language onboarding fields and editable profile details.
- Client-side Firestore matchmaking queue and peer-created chat documents.
- Realtime anonymous and permanent chat messages, typing state, and permanent-chat read receipts.
- Friend requests, friendships, in-app notifications, friend list, and profile pages.
- Settings, local privacy toggles, theme selection, blocked-user management, safety copy, guidelines, and FAQ.
- A local demo-account path exposed in development builds.

Feature status is qualified in [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md). Several surfaces are UI-only or partial, including reports, stranger blocking, support submissions, privacy preferences, and the demo matchmaking path.

## Important Product Caveats

- The active client calls the experience Ryple; repository/project name and static reference say Bondly.
- Anonymous login exists as an unused helper, not as the active account/session flow.
- The selected dashboard vibe is not passed into the matchmaking service.
- Matching is client-side Firestore coordination, not a Cloud Function or AI service.
- The timer routes to a summary page but does not delete the anonymous chat or its messages.
- Safety Center and FAQ claims about deletion and participant-only access do not fully match code and Firestore rules.
- No admin/moderation console or report-processing backend is present.

See [APPLICATION_FLOW.md](APPLICATION_FLOW.md), [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md), and [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for evidence and behavior details.
