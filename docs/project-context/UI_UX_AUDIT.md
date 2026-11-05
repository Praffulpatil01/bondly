# UI/UX Audit

## Current Visual System

- Soft lavender/purple theme with white/lavender surfaces, rounded panels, gradients, blur/glass effects, and frequent shadows.
- `src/styles/index.css` defines Tailwind v4 theme colors, spacing/radius tokens, typography utilities, and animation utilities. Many page surfaces also use literal hex values, so token usage is inconsistent.
- Inter is body text and Outfit is display text, loaded from Google Fonts in `index.html`; Material Symbols are also remote. Lucide icons, Material Symbols, emoji, remote raster imagery, and CSS decorations coexist.
- Most authenticated pages use a fixed top bar and fixed bottom navigation, with mobile-first spacing and Tailwind breakpoints for wider screens. The landing page uses a longer editorial/marketing layout.
- Framer Motion and IntersectionObserver provide animation/reveal effects. No reduced-motion strategy was found.

## Strengths

- Clear concept in landing/onboarding copy: topic-led anonymous conversation, time limit, mutual friendship.
- Reusable buttons, inputs, cards, labels, loaders, navigation, message bubbles, and notification cards are present.
- Loading, empty, error, and success states exist in several flows.
- Layouts include responsive classes and chat-specific desktop/mobile arrangements.
- Theme tokens provide a recognizable starting point, and main workflows are organized into feature modules.

## Weaknesses and Risks

- Brand inconsistency: repository/design reference says Bondly, while active product, title, copy, demo keys, and support identity say Ryple.
- Style inconsistency: custom token system, literal Tailwind colors, page-specific palette overrides, Material Symbol strings, and Lucide create multiple visual idioms.
- Numerous dead controls and misleading claims: report, profile block/report, privacy toggles, support message, photo action, forgot-password, and footer links do not perform their stated action.
- Demo data/placeholders remain visible: fixed avatars, online dots, sample time-up stats, scripted chat, sample demo profile, badges, and marketing metrics.
- Purple-on-lavender dominates across the product; gradients, glass, and rounded cards are repeated heavily.
- Remote image/font dependence can fail and sends requests to third parties. Local bundled images were not referenced by app code; `.png` names do not match JPEG file content.
- Accessibility needs focused work: clickable `div`s, icon-only buttons without consistent accessible names, contrast/focus states need auditing, decorative images often have generic alt text, and keyboard/screen-reader behavior for swipes and custom switches is inconsistent.
- Loading behavior is inconsistent: demo paths can show empty/blocked screens; notifications/friends/permanent chat have Firebase-user-only paths even though route guards also permit demo users.
- Anonymous-chat page timer is ten minutes, while `ChatHeader` progress maximum is three minutes. The time-up view uses sample values if entered directly.

## Responsiveness and Accessibility Assessment

Source contains responsive Tailwind classes (desktop side panel, grids, `md`/`lg` adjustments), but no automated visual regression tests, Playwright setup, or viewport screenshots are present. Source intent is responsive; actual layout quality at device sizes remains unverified.

Semantic forms and labels are used on auth pages. Elsewhere, native buttons are mixed with interactive non-button containers, and some icon controls lack accessible names. No accessibility test script, audit report, or consistent reduced-motion handling was found.

## Gen Z Premium Transformation Recommendations

Do not redesign until product behavior and naming are confirmed. Then:

1. Settle Bondly vs Ryple and align titles, favicon, support links, demo data, and copy.
2. Define a coherent visual direction around social discovery and conversation; retain usable contrast but reduce repeated purple gradients/glass treatment. Establish semantic color, type, spacing, surface, and motion tokens before page changes.
3. Make actual live state the visual centerpiece: selected vibe, matchmaking status, stranger chat, mutual-consent moment, friend connection. Avoid illustrative AI, activity, or safety claims not backed by services.
4. Design compact, ergonomic mobile-first flows with clear chat controls, a consistent timer, visible report/block outcomes, resilient keyboard/viewport behavior, and predictable desktop adaptation.
5. Replace inert controls with working flows or remove/label them honestly. Use robust owned profile assets and fallbacks rather than brittle remote sprite crops.
6. Meet accessibility needs: semantic buttons/switches, accessible names, focus indicators, contrast, keyboard operation, reduced motion, and screen-reader status announcements.
7. Validate with real viewport/browser testing and accessibility checks after behavior and security foundations are stable.

This is recommendation only; no redesign has been implemented. Related product status: [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md).
