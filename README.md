# ChildGuardID

A React Native mobile application for creating and managing child identification profiles. Designed to support rapid identification in missing child scenarios — parents and guardians can store essential physical descriptors, medical information, emergency contacts, and export a image-style card for law enforcement or public use.

All data is stored locally on-device. No cloud, no accounts, no external servers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native via Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Forms & Validation | React Hook Form + Zod |
| Storage | AsyncStorage (on-device only) |
| Image Export | react-native-view-shot |
| Testing | Jest + React Testing Library |

**Why Expo?** Native performance is required for on-device rendering. Capacitor/WebView approaches hit JavaScript performance limits. Expo lets us target iOS, Android, and Web from a single TypeScript codebase.

**Why Zod?** Eliminates large chains of manual `if` validation. The schema is the single source of truth for what a valid child profile looks like — always define logic in the schema before generating form fields.

---

## Project Structure

```
3800Group22/
├── app/                          # Expo Router pages (file = route)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator config
│   │   ├── index.tsx             # Home screen — child profile list
│   │   └── add_child.tsx         # 4-step form wizard (create & edit)
│   ├── view_child.tsx            # Child detail view & image export
│   ├── _layout.tsx               # Root layout & navigation stack
│   └── __tests__/
├── components/
│   ├── child-image.tsx        # Image card renderer (ViewShot wrapper)
│   ├── ui/                       # Reusable UI components
│   │   ├── icon-symbol.tsx       # Android/Web icon fallback
│   │   ├── icon-symbol.ios.tsx   # iOS SF Symbols (platform-specific)
│   │   ├── use-color-scheme.web.ts  # Web hydration (platform-specific)
│   │   └── ...
│   └── __tests__/
├── hooks/
│   ├── useChildrenStorage.ts     # AsyncStorage abstraction layer
│   └── __tests__/
├── types/
│   └── child.ts                  # Zod schemas & TypeScript types
├── constants/
│   └── theme.ts                  # Color palette & semantic tokens
├── styles/
│   ├── index.ts                  # Barrel export
│   ├── shared.ts                 # Common spacing, radius, shared styles
│   ├── add_child.styles.ts       # Form wizard styles
│   └── index.styles.ts           # Home screen styles
├── Start ChildGuard.bat          # Windows one-click launcher
├── Start ChildGuard.command      # macOS one-click launcher
└── ChildGuardID-Doc/             # Separate Docusaurus documentation site
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version)
- [Expo Go](https://expo.dev/go) app installed on your iOS or Android device

### One-Click Launch (Recommended)

**Windows:** Double-click `Start ChildGuard.bat`

**macOS:** Double-click `Start ChildGuard.command`

Both launchers will install dependencies on first run and present three connection options:

| Option | Command | Use When |
|---|---|---|
| 1 | `expo start --offline` | Hotspot or isolated local network |
| 2 | `npm start` | Standard Wi-Fi LAN |
| 3 | `expo start --tunnel` | Networks that block LAN (school, corporate) |

Scan the QR code from Expo Go once the server starts. Your device and computer must be on the same network for options 1 and 2.

### Manual Setup

Make sure you're in the project directory
```bash
cd ChildGuardID
npm install
npm start
```

> The app bundle is large. Cloning and first install may take a few minutes.

### Running in a Browser

If you don't have 'Expo Go' installed on your phone and would like to make preview changes, you can run this app on the browser

```bash
npm start
# Press W in the terminal to open in browser
```

***Note:** Some native features (camera, media library) are unavailable in the web build. Additionally, features like 'Generate Image' will not work on computers, and format may differ slightly on web app*

---

## Running Tests

```bash
npm test           # Run all tests once
npm test --watch   # Watch mode
```

Tests cover:
- Zod schema validation (field rules, edge cases)
- Form component rendering and interactions
- AsyncStorage CRUD operations
- UI component unit tests
- Theme and color constant integrity

---

## Documentation Site

The `ChildGuardID-Doc/` folder contains a standalone [Docusaurus](https://jackyfhuang.github.io/3800Group22/) site for owners and stakeholders. Or to open on local machine:

```bash
cd ChildGuardID-Doc
npm install
npm start
# Open http://localhost:3000/ChildGuardID-Doc/
```

---

## Critical Code — Do Not Modify Carelessly

The following areas are load-bearing. Changes here have wide-reaching effects and require thorough testing before merging.

### Zod Validation Schema

**Files:** `types/child.ts` and `app/(tabs)/add_child.tsx` (top of file)

The schema is the source of truth for every child profile. It enforces field types, ranges, and required fields across the entire app. Key rules:

- Full name: 2+ characters
- Age: 0–18
- Height: 30–250 cm
- Weight: 2–200 lbs
- At least one emergency contact required
- Guardian 1 requires an address; Guardian 2 is optional

> **Warning:** The schema is currently defined in two places — `types/child.ts` and inline in `add_child.tsx`. Any rule change must be applied to **both files** or validation behavior will diverge.

### AsyncStorage Data Structure

**File:** `hooks/useChildrenStorage.ts`

All child profiles are stored under the key `"children_list"` as a JSON array. The shape of each record is defined by `ChildProfile` in `types/child.ts`.

```
Key:   "children_list"
Value: JSON array of ChildProfile objects
ID:    Date.now().toString() — used to match profiles on edit/delete
```

- Do **not** rename the storage key — it will orphan all saved profiles on existing devices.
- Do **not** change the ID generation strategy without updating all lookup logic in `add_child.tsx` and `view_child.tsx`.
- The hook contains a one-time migration from an older single-profile format (`"child_profile"` → `"children_list"`). Do not remove this migration while devices running the old format may still exist.

### ViewShot / Image Export Pipeline

**Files:** `components/child-image.tsx`, `app/(tabs)/add_child.tsx`

The image card is rendered off-screen at a fixed resolution and captured as an image.

- Export dimensions: **1080 × 1680 px** — hardcoded for print quality. Do not change without also updating the preview scale calculations.
- `react-native-view-shot` must stay at version **4.0.3**. Newer versions have breaking API changes.
- A `30ms setTimeout` before capture in `add_child.tsx` is intentional — it gives the off-screen view time to complete its render pass before the screenshot is taken. Removing it causes blank or incomplete captures on some devices.

### Expo Router File Naming

**Folder:** `app/`

The folder and file structure **is** the routing system. Renaming or moving a file changes its URL, which breaks any `router.push()` or `<Link>` call pointing to it.

| File | Route |
|---|---|
| `app/(tabs)/index.tsx` | `/` (Home) |
| `app/(tabs)/add_child.tsx` | `/(tabs)/add_child` |
| `app/view_child.tsx` | `/view_child?id=...` |

### Platform-Specific Files

Expo uses file extension suffixes to serve different code per platform. Both variants must exist and stay in sync.

| File | Platform |
|---|---|
| `components/ui/icon-symbol.ios.tsx` | iOS — uses native SF Symbols |
| `components/ui/icon-symbol.tsx` | Android / Web — uses Material Icons |
| `hooks/use-color-scheme.web.ts` | Web — handles SSR hydration |
| `hooks/use-color-scheme.ts` | iOS / Android |

Deleting either variant of a pair will cause the other platform to crash or silently fall through to the wrong implementation.

---

## Known Issues & Limitations

### Image Capture Timing (Fragile)
The 30ms delay before `captureRef()` in `add_child.tsx` is a workaround for a render timing race condition. On low-end or heavily loaded devices this delay may not be sufficient, resulting in a blank or partially rendered export image. If this becomes a recurring issue, the delay value may need to be increased or replaced with a render-complete callback.

### TypeScript `as any` Workarounds
Several type casts exist throughout `add_child.tsx` and `view_child.tsx` due to mismatches between React Hook Form's generic types and the Zod-inferred types. These are annotated with inline comments where relevant. They do not affect runtime behavior but reduce type safety in those areas.

### No Cloud Sync
All data lives exclusively in AsyncStorage on the local device. There is no backup, sync, or export-to-account feature. If the app is uninstalled or the device is lost, all profiles are gone. This is a known scope limitation, not an oversight.

### Expo SDK Version
The project targets **SDK 54**. Migration to SDK 55 is planned but not yet complete. Avoid running `expo upgrade` without coordinating with the team, as it may require dependency updates across the board.

### Duplicate Schema Definition
As noted above, the Zod schema exists in two files. This is a known tech debt item. The correct long-term fix is to import the shared schema from `types/child.ts` into `add_child.tsx` rather than redefining it inline.

---

## Maintenance Tips

- **Adding a new profile field:** Update the Zod schema in `types/child.ts`, mirror it in `add_child.tsx`, add the field to the appropriate form step, and update the `STEP_FIELDS` validation map to include it in the correct step's validation trigger.

- **Adding a new screen:** Create the file in the appropriate `app/` subfolder. Expo Router picks it up automatically — no route registration needed.

- **Changing the image card layout:** Edit `components/child-image.tsx`. The card renders at 1080×1680 internally; the preview is a scaled-down version of the same component. Changes to one affect both.

- **Debugging storage issues:** Use `npx expo start` with the Expo Dev Tools open. AsyncStorage contents can be inspected via React Native Debugger or Flipper.

- **Before upgrading any dependency:** Check `react-native-view-shot` compatibility first — it is the most version-sensitive package in the project.

- **Testing on real devices:** The simulator is sufficient for most UI work, but always verify image export and camera/media library permissions on a physical device before releasing.

---
## Focus Group Presentation

The main objective of this presentation was to generate interest, identify concerns, and evaluate the usability of the application.

A demo of the app was presented to a small group with diverse backgrounds, including police officers, teachers, and parents. Security concerns were addressed for the officers and teachers; however, some parents still expressed concerns. 

From a usability perspective, all participants were satisfied with the app’s ease of use. Improvements to formatting and additional input fields were implemented based on participant feedback.

- A copy of the [PowerPoint presentation](https://docs.google.com/presentation/d/1Hwv8qyrp5ukEEZoh2xxxscoq14gABS2kIXaxXfEDvzg/edit?usp=sharing)
- A copy of the [evaluation form](https://forms.gle/fqcwgwxCQwvWFwYS9)

---

## Future Client Expectations

Our client, Ms. Karen Sidhu from the KOM Community Policing Centre, sees potential for this project to be adapted for use with seniors. A simplified revamp of the application would be the most practical approach.

Additional future considerations include:

- Approval from the Vancouver Police Department (VPD)
- Deployment to the Apple App Store

---

## Authors

### BCIT Students 2026 Jan - Apr

- Titus Lee
- Jack Huang
- Yang Li
- Brownie Khoi Nguyen Tran