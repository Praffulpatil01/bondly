# Technology Stack

Versions are those resolved in this workspace by `npm ls --depth=0`, not just semver ranges in `package.json`. The build completed using the installed tree. React packages are not declared directly in `package.json`; npm resolves them as peers.

## Active Application Stack

| Technology | Installed version | Use and status |
| --- | --- | --- |
| React | 19.2.8, peer-installed | UI components/hooks across `src/`; actively used, but missing direct dependency declaration. |
| React DOM | 19.2.8, peer-installed | Browser rendering in `src/main.tsx`; active, but missing direct dependency declaration. |
| TypeScript | 6.0.3 | Source language and strict type checking; `npm run build` runs `tsc`. |
| Vite | 8.2.0 | Dev server and production bundler; active. |
| React Router (`react-router`) | 8.3.0 | Browser routing/navigation in `src/main.tsx` and pages; active. |
| Tailwind CSS | 4.3.3 | Utility styling; imported in `src/styles/index.css`. |
| `@tailwindcss/vite` | 4.3.3 | Tailwind Vite integration in `vite.config.ts`; active. |
| Firebase JS SDK | 12.17.0 | Auth, Firestore, initialization in feature code; active. Storage/Functions helpers exist but are not consumed by product features. |
| Framer Motion | 12.43.0 | Page transitions, animation, drag/swipe, reveal behavior; active. |
| Zustand | 5.0.14 | Notification list/filter state in `src/features/notifications/store/notification.store.ts`; active. |
| `next-themes` | 0.4.6 | Theme provider and dark-mode setting; active. |
| React Hook Form | 7.84.0 | Login and signup forms; active. |
| `@hookform/resolvers` | 5.6.0 | Zod form integration; active. |
| Zod | 3.25.76 | Login/signup schemas and environment parsing; active. |
| `emoji-picker-react` | 4.19.1 | Emoji controls in both chat experiences; active. |
| `lucide-react` | 1.28.0 | Application icons; active. |
| Sonner | 2.0.7 | Toast feedback in auth, chat, profile, and settings; active. |
| `date-fns` | 4.4.0 | Relative notification timestamps; active. |
| `clsx` | 2.1.1 | Conditional class assembly in `src/lib/utils.ts`; active. |
| `tailwind-merge` | 3.6.0 | Class conflict resolution in `src/lib/utils.ts`; active. |

## Remaining Declared Packages

| Package | Installed version | Where/why; observed status |
| --- | --- | --- |
| `@commitlint/cli` | 21.2.1 | Declared dev tool; no commitlint config or script found, so not configured. |
| `@commitlint/config-conventional` | 21.2.0 | Commit-message preset; no config references found. |
| `@eslint/js` | 9.39.5 | ESLint base config package; no ESLint configuration found. |
| `@testing-library/jest-dom` | 7.0.0 | Test matchers; no test setup/files or test script found. |
| `@testing-library/react` | 16.3.2 | Component test utility; no tests found. It also participates in peer resolution of React. |
| `@testing-library/user-event` | 14.6.1 | Test interaction utility; no tests found. |
| `@types/node` | 26.1.2 | Type declarations for Node-based Vite tooling; dev-only. |
| `@types/react` | 19.2.18 | Type declarations used to type-check TSX. |
| `@types/react-dom` | 19.2.4 | Type declarations used to type-check browser rendering. |
| `@vitest/coverage-v8` | 4.1.10 | Coverage provider; no tests or coverage script found. |
| `eslint` | 9.39.5 | Lint tool; no configuration or npm lint script found. |
| `eslint-config-prettier` | 10.1.8 | Lint/format integration; no config references found. |
| `eslint-plugin-jsx-a11y` | 6.10.2 | Accessibility lint rules; not configured. |
| `eslint-plugin-react` | 7.37.5 | React lint rules; not configured. |
| `eslint-plugin-react-hooks` | 7.1.1 | Hooks lint rules; not configured. |
| `husky` | 9.1.7 | Git-hook manager; no `.husky` hook setup found. |
| `jsdom` | 29.1.1 | DOM test environment; no test config/script found. |
| `lint-staged` | 17.3.0 | Staged-file lint runner; no config or hook found. |
| `prettier` | 3.9.6 | Formatter; no format script/config found. |
| `prettier-plugin-tailwindcss` | 0.8.1 | Tailwind class formatter plugin; not configured. |
| `typescript-eslint` | 8.65.0 | TypeScript lint integration; no ESLint config found. |
| `@tanstack/react-query` | 5.101.4 | No query client/provider or imports found; unused by active product. |
| `@tanstack/react-query-devtools` | 5.101.4 | No devtools provider/import found; unused. |
| `recharts` | 3.10.1 | No chart usage found; unused by active product. |
| `vite-plugin-pwa` | 1.3.0 | Not wired into Vite; no manifest/service-worker setup found. |
| `workbox-window` | 7.4.1 | No Workbox import/use found; unused. |

No test files, lint configuration, hooks, or matching scripts were found despite the related packages being installed. The generalized `src/services/firebase/` layer and barrel are also not imported by active features; its Storage/Functions APIs and emulator connectors are scaffolding, not verified product capabilities.

## Languages, Styling, State, Backend

- TypeScript/TSX is the application language; `stitch.html` is static HTML.
- Tailwind CSS v4 plus custom CSS theme tokens in `src/styles/index.css`; no `tailwind.config.*` is present. Many pages also use literal colors and page-specific styling.
- State is mostly component-local, with `AuthContext` for Firebase auth and Zustand for notifications. React Query is not active.
- Firebase Authentication and Cloud Firestore are the active backend. No custom server, deployed Cloud Function source, or active Storage feature is present in this repository.
- Realtime behavior uses Firestore `onSnapshot` for queue status, messages, typing, friends, and notifications.
- External integrations include Google sign-in, Google Fonts/Material Symbols, remote Google-hosted avatar imagery, Dicebear imagery, and static mailto/X links. No active analytics call was found although a measurement-ID env variable exists.

## Infrastructure and Configuration

`firebase.json` configures Firestore rules from `firestore.rules` and Firebase Hosting from `dist` with a SPA rewrite to `index.html`. The repository does not configure Storage rules, Functions deployment, Firestore indexes, or Firebase Emulator Suite ports. `.firebaserc` exists. Environment variable names and setup instructions are in [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md); values are deliberately not reproduced here.

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for ownership and [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) for data flow.
