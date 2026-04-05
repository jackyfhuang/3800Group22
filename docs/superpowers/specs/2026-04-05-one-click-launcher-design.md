# One-Click Launcher — Design Spec

**Date:** 2026-04-05
**Project:** ChildGuard (Expo React Native)
**Goal:** Let a non-technical client start the app by double-clicking a single file, with zero "What do I do now?" moments.

---

## Delivery Context

- Client receives the project as a **ZIP file** and extracts it
- `node_modules/` is **not** included in the ZIP
- Node.js is installed separately via a setup guide (not handled by the launcher)
- The launcher is the everyday entry point after one-time setup

---

## Files

Two scripts, one per platform, placed at the **project root**:

| File | Platform | Launch method |
|---|---|---|
| `Start ChildGuard.bat` | Windows | Double-click in File Explorer |
| `Start ChildGuard.command` | macOS | Double-click in Finder (first time: right-click → Open) |

Both scripts are identical in behavior and produce the same branded output using ANSI color codes.

---

## Script Flow

### 1. Branded Header
Display a colored ASCII border with the ChildGuard name and a short tagline. Sets the tone and confirms the right file was launched.

### 2. Node.js Check
Run `node --version`. If Node is not found:
- Print a clear error message
- Display the URL: `https://nodejs.org`
- Exit with a non-zero code

If Node is found, continue silently.

### 3. First-Run Install
Check if `node_modules/` exists in the project directory.
- If **absent**: print "Setting up for the first time — this may take a few minutes..." and run `npm install`
  - If `npm install` fails: print an error message telling the client to check their internet connection, then exit
  - If it succeeds: print "Setup complete!" and continue
- If **present**: skip silently

### 4. Network Mode Menu
Print a labeled menu with three numbered options:

```
How are you connecting?

  [1] Hotspot       — npx expo start --offline
  [2] Wi-Fi         — npm start
  [3] Other / Tunnel — npx expo start --tunnel

Enter 1, 2, or 3:
```

- Invalid input loops back to the menu with a gentle prompt ("Please enter 1, 2, or 3")
- Valid input launches the corresponding command

### 5. Pre-Launch Instructions Footer
Immediately before handing off to Expo (which will display the QR code), print:

```
Starting ChildGuard...

  On your phone:
  1. Open the Expo Go app
  2. Tap "Scan QR Code"
  3. Point your camera at the QR code below

Press Ctrl+C (Windows) / Cmd+C (Mac) to stop the server.
```

### 6. Launch
Execute the selected Expo command. The terminal stays open showing the Expo output and QR code.

---

## Aesthetics

- **Windows `.bat`**: ANSI escape codes via `echo` with `ESC[` sequences; green header, white body, yellow menu labels
- **macOS `.command`**: Standard ANSI escape codes via `echo -e`; same color scheme
- No external tools or dependencies — pure shell

---

## Error States

| Condition | Behavior |
|---|---|
| Node.js not installed | Print error + nodejs.org URL, exit |
| `npm install` fails | Print error + "check internet connection", exit |
| Invalid menu input | Re-display menu with correction prompt |
| Expo start fails | Expo's own error output is shown; script exits when Expo exits |

---

## Out of Scope

- Installing Node.js (covered by separate setup guide)
- Android/iOS emulator support
- Updating the app or pulling new ZIP versions
- Any GUI or web-based launcher
