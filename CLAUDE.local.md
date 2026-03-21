# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator/device
npm run web        # Start in browser
npm run lint       # Run ESLint (expo lint)
npm test           # Run Jest tests
npm run test:watch # Run Jest in watch mode
```

Scan the QR code from the Expo Go app on a physical device to test, or use an emulator/simulator.

## Architecture

**ChildGuard** is a React Native/Expo app for managing child safety profiles. Profiles are stored locally via `AsyncStorage`.

### Routing (Expo Router — file-based)

```
app/
  _layout.tsx          # Root Stack navigator
  modal.tsx            # Generic modal screen
  view_child.tsx       # View/edit child profile (modal)
  (tabs)/
    _layout.tsx        # Bottom tabs navigator (single "Home" tab)
    index.tsx          # Home screen — lists child profiles
    add_child.tsx      # Multi-step form to add a new child profile
```

Screens outside `(tabs)/` are presented as modals via the root Stack. Navigation between screens passes data through `useLocalSearchParams`.

### Forms

`add_child.tsx` uses a multi-step wizard pattern:
- **React Hook Form** manages form state across steps
- **Zod** schemas validate each step
- `@hookform/resolvers/zod` connects them
- `step-progress-bar` shows current step; navigation controlled by step index state

### Components

`components/ui/` holds the shared UI library:
- `form-field.tsx` — labeled text input with validation error display
- `app-dropdown.tsx` — inline dropdown selector
- `form-section.tsx` — collapsible/grouped form section wrapper
- `date-picker-modal.tsx` — modal date picker (wraps `react-native-modal-datetime-picker`)
- `step-progress-bar.tsx` — multi-step progress indicator

### Design System

`constants/theme.ts` is the single source of truth for colors, spacing, border radii, and typography. Screen-specific styles live in `styles/` (e.g., `add_child.styles.ts`). Shared cross-screen styles are in `styles/shared.ts`. Import alias `@/*` maps to the repo root.

### Data Persistence

All child profiles are stored in `AsyncStorage`. The home screen loads profiles on mount and on pull-to-refresh. No backend or network layer exists yet.

### Key Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `react-hook-form` + `zod` | Form state & validation |
| `@react-native-async-storage/async-storage` | Local persistence |
| `react-native-modal-datetime-picker` | Date selection UI |
| `react-native-view-shot` + `react-native-html-to-pdf` | PDF export of profiles |
| `react-native-reanimated` | Animations |

### Notes

- `newArchEnabled: true` and `experiments.reactCompiler: true` are enabled in `app.json` — be aware of React 19 / New Architecture compatibility when adding native dependencies.
- The app targets portrait orientation only.
- Dark/light theme is handled automatically via `useColorScheme` and the semantic color tokens in `theme.ts`.
