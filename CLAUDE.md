# 10Alytics Mobile

> Built on the [Obytes React Native starter](https://github.com/obytes/react-native-template-obytes) (foundation), with the 10Alytics app ported on top. See migration notes in the agent memory.

## Technology Stack

- **Expo SDK 56** with React Native 0.85.3 / React 19.2 — managed (CNG) workflow, dev-client
- **TypeScript** — strict
- **Expo Router 6** — file-based routing
- **TailwindCSS via Uniwind** — utility-first styling using the `className` prop on React Native components
- **Zustand** — global state (auth store)
- **React Query** — server state + data fetching, with MMKV-backed offline persistence
- **TanStack Form + Zod** — type-safe forms (adopt for new/edited forms)
- **MMKV** — local key/value storage; **expo-secure-store** — auth token
- **Laravel Echo + pusher-js (Reverb)** — realtime chat
- **expo-notifications** — push + local notifications

## Project Structure

```
src/
├── app/              # Expo Router routes: _layout (auth guards), (tabs), (screens) modal group, onboarding, auth routes, chat-room
├── screens/          # Screen implementations grouped by area (tabs, course, classroom, auth, onboarding, start)
├── components/        # Shared components (+ components/ui starter design system, course-video-player, classroom, gamification, onboarding)
├── tw/               # className-enabled RN component wrappers over uniwind (View, Text, PressableScale w/ haptics, Animated, Image)
├── hooks/            # React Query data hooks + theme/nav hooks
├── lib/              # api-client, api-url, chat-realtime, notifications, query-client, api/ (provider + offline persistence)
├── utils/            # auth-store, cn, date, html-content, video-platform, course-cover, resolve-media-url
├── contexts/         # ThemeContext (adapter over uniwind theme)
├── constants/ configs/ themes/ types/
└── global.css        # Tailwind v4 @theme tokens (uniwind)

Root: env.ts (typed env + identity), app.config.ts, eas.json
```

## Development

```bash
pnpm start              # Metro (pinned to localhost + --dev-client for the iOS sim)
pnpm ios / pnpm android # build & run
pnpm lint               # ESLint
pnpm type-check         # tsc --noemit
```

## Styling rules

- **Always use Tailwind/uniwind `className`** instead of inline styles. Use the `style` prop only for dynamic values that can't be expressed in Tailwind.
- For RN components, importing from `react-native` already supports `className` (uniwind augments them); the `@/tw` wrappers add haptics/animated/image helpers.

## Key conventions

- Absolute imports with the `@/` prefix (e.g. `@/components/...`, `@/lib/...`).
- Data fetching: React Query hooks in `src/hooks` over `@/lib/api-client`.
- Auth: `@/utils/auth-store` (Zustand, secure-store persisted); token managed by `@/lib/api-client`.
- New forms: TanStack Form + Zod.
- Do NOT edit `android/`/`ios/` directly — use Expo config plugins in `app.config.ts`.
