# Development Setup

## Verified Environment

- Node.js: `v24.22.2`
- npm: `11.19.1`
- Package manager: npm, evidenced by `package-lock.json` and npm scripts.
- Vite: `8.2.0`; TypeScript: `6.0.3`; React/React DOM: `19.2.8` resolved as peers.
- Current installed dependencies are present. `npm ls --depth=0` completed successfully.
- `npm run build` completed successfully (TypeScript plus Vite production bundle). It reported a `__dirname` Vite config warning, two ineffective dynamic-import warnings, and a minified output chunk above 500 kB.

## Install and Run

For a fresh checkout, use the lockfile-based install:

```sh
npm ci
npm run dev
```

Production build and local preview:

```sh
npm run build
npm run preview
```

Scripts in `package.json` are only `dev`, `build`, and `preview`. No test, lint, typecheck-only, or format script is defined. The `build` script runs `tsc && vite build`.

The audited workspace already had installed dependencies, so no install was run. Existing `package-lock.json` had a pre-existing worktree modification and was left untouched.

## Environment Configuration

`src/config/env.ts` validates these Vite variables; values are intentionally omitted:

- Required Firebase web config: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- Optional: `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_APP_URL`.
- `VITE_APP_ENV` defaults to development and accepts `development`, `staging`, or `production`.
- `VITE_USE_FIREBASE_EMULATORS` defaults to false; when true the generalized config attempts Auth `localhost:9099`, Firestore `localhost:8080`, Storage `localhost:9199`, and Functions `localhost:5001`.

`.env.development` and `.env.production` are present and tracked in this checkout; their contents are not documented here. `.gitignore` ignores env files for future untracked additions but does not untrack existing files. There is no `.env.example`. Since `VITE_*` values are client-side values, do not place private credentials in them. The successful production build indicates this workspace has usable required config, but the values were not read and the Firebase project was not contacted by the build.

For a fresh environment, provision required client config through the organization's approved config mechanism. If using emulators, configure/start each emulator separately; this repository does not include Firebase emulator configuration in `firebase.json`.

## Build Configuration

- `vite.config.ts` enables React and Tailwind plugins and maps `@` to `src`.
- `tsconfig.json` uses strict TypeScript, bundler module resolution, no emit, and `@/*` path alias.
- Tailwind v4 is imported/themed in `src/styles/index.css`; no separate Tailwind config exists.
- `firebase.json` deploys `dist` as Hosting content and rewrites paths to `index.html`.
- Firebase rules path is `firestore.rules`.
- `tsconfig.node.json` type-checks `vite.config.ts`.

## Verification Status and Limitations

The build is verified locally. No test files, test script, lint configuration, preview smoke test, browser interaction test, Firebase Emulator Suite config, or deployed-project access was found/used. Production behavior, Auth provider enablement, Firestore indexes, rules deployment, Hosting deployment, and actual chat between separate users remain unverified. Vite warns that `__dirname` in `vite.config.ts` will need attention for native config loading, and it emits a large JS chunk.
