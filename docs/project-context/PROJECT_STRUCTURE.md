# Project Structure

This tree includes relevant source, configuration, public assets, and design references. Generated output, caches, `node_modules`, and `.git` are excluded. Environment files are omitted to avoid disclosing configuration values; their presence and required variable names are documented separately.

```text
bondly/
|-- firebase.json
|-- firestore.rules
|-- index.html
|-- package.json
|-- package-lock.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
|-- stitch.html
|-- stitch_landing_page.html             # empty file
|-- public/
|   |-- favicon.svg
|   |-- icons.svg
|   `-- images/{avatars.png,mascot.png,safety.png}
`-- src/
    |-- main.tsx
    |-- vite-env.d.ts
    |-- assets/{hero.png,typescript.svg,vite.svg}
    |-- components/
    |   |-- auth/{GuestRoute,ProtectedRoute}.tsx
    |   |-- layout/BottomNav.tsx
    |   `-- ui/{Button,Card,Checkbox,Input,Label,Loader,Separator}.tsx
    |-- config/{app,env,firebase}.ts
    |-- context/AuthContext.tsx
    |-- features/
    |   |-- auth/{components/AuthLayout.tsx,pages/{LoginPage,SignUpPage}.tsx}
    |   |-- chat/
    |   |   |-- components/{ChatHeader,FriendRequestModal,MessageBubble,MessageInput,SystemMessage,TypingIndicator}.tsx
    |   |   |-- pages/{AnonymousChatPage,PermanentChatPage,TimeUpPage}.tsx
    |   |   `-- services/{chat.service,permanent-chat.service}.ts
    |   |-- dashboard/pages/DashboardPage.tsx
    |   |-- friends/{components/FriendCard.tsx,pages/{FriendProfilePage,FriendsListPage}.tsx,services/friends.service.ts}
    |   |-- landing/pages/LandingPage.tsx
    |   |-- matching/{components/{FunFactCard,LoadingDots,MatchStatus,StatsCard}.tsx,pages/MatchSearchPage.tsx,services/matchmaking.service.ts}
    |   |-- notifications/{components/{EmptyNotification,NotificationBadge,NotificationCard,NotificationTabs}.tsx,pages/NotificationsPage.tsx,services/notification.service.ts,store/notification.store.ts}
    |   |-- onboarding/pages/OnboardingPage.tsx
    |   |-- profile/{components/EditProfileModal.tsx,pages/MyProfilePage.tsx}
    |   `-- settings/pages/{BlockedUsersPage,GuidelinesPage,HelpSupportPage,PrivacyPage,SafetyCenterPage,SettingsPage}.tsx
    |-- firebase/{auth,collections,config,firebase,firestore}.ts
    |-- lib/utils.ts
    |-- services/firebase/{auth,config,firestore,functions,index,storage}.ts
    |-- styles/index.css
    `-- types/{chat,friend,index,notification,user}.ts
```

## Ownership and Key Files

- `src/main.tsx`: mounts providers and declares all URL routes. No explicit not-found route.
- `src/context/AuthContext.tsx`, `src/components/auth/`: Firebase auth state, online/offline writes, logout, and route gating. Guards also accept a local-storage demo marker.
- `src/features/`: product pages/components and feature-specific Firebase service code.
- `src/firebase/`: active typed collection references, profile/request types, Firebase initialization, and simple Firestore helpers. Most features import this layer.
- `src/config/firebase.ts`: second Firebase initialization path used by matching; `src/firebase/firebase.ts` is another initialization path. Both reuse the default app if it exists.
- `src/services/firebase/`: generalized CRUD/query helpers, emulator connectors, Storage, and callable Functions. Its barrel is not used by active features.
- `src/types/`: generic domain models, including report/settings concepts that do not match the live `src/firebase/collections.ts` model and are not used by feature code.
- `src/styles/index.css`: Tailwind v4 import, theme variables, typography utilities, and custom animation helpers.
- `vite.config.ts`: React and Tailwind Vite plugins plus `@` alias.
- `firebase.json`, `firestore.rules`: Hosting/Firestore deploy configuration and database rules.
- `index.html`: actual Vite document, Ryple title/metadata, Google Font and Material Symbols links, and React root.
- `stitch.html`: standalone, non-routed static Bondly landing design reference. It loads Tailwind from CDN and has no app navigation behavior.
- `stitch_landing_page.html`: empty.
- `public/images/*`, `src/assets/*`, and `public/icons.svg`: files are present, but code search did not find application references to them. Several `.png` files under `public/images` are JPEG-encoded despite their extension.

## Architecture Notes

The feature-first layout and service modules are a useful base, but there are duplicate Firebase abstractions, duplicate/incompatible type models, and inconsistent direct Firestore access from pages and services. The active application is not driven through the generalized Firebase barrel. See [TECH_STACK.md](TECH_STACK.md) and [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md).
