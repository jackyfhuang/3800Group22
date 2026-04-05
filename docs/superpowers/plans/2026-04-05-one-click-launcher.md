# One-Click Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two double-clickable launcher scripts (`Start ChildGuard.bat` for Windows, `Start ChildGuard.command` for macOS) that auto-install dependencies, present a 3-option network menu, and launch the Expo dev server with branded ANSI output.

**Architecture:** Two standalone shell scripts at the project root — no shared code between them. Each script is self-contained: branded header → Node.js check → first-run `npm install` → network menu loop → pre-launch instructions → exec Expo. No new npm dependencies.

**Tech Stack:** Windows Batch (`.bat`), Bash (`.command`), ANSI escape codes, Expo CLI

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Create | `Start ChildGuard.bat` | Windows launcher |
| Create | `Start ChildGuard.command` | macOS launcher |

---

## Task 1: Create the Windows launcher (`Start ChildGuard.bat`)

**Files:**
- Create: `Start ChildGuard.bat`

- [ ] **Step 1: Create the file with the full script**

Create `Start ChildGuard.bat` at the project root with this exact content:

```batch
@echo off
setlocal

cd /d "%~dp0"

for /f %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "RESET=%ESC%[0m"

echo %GREEN%╔══════════════════════════════════════════╗%RESET%
echo %GREEN%║          ChildGuard App Launcher          ║%RESET%
echo %GREEN%║      Keeping families safe, one scan      ║%RESET%
echo %GREEN%╚══════════════════════════════════════════╝%RESET%
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js is not installed.%RESET%
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version, run the installer, then launch this file again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Setting up for the first time -- this may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo %RED%Setup failed. Check your internet connection and try again.%RESET%
        echo.
        pause
        exit /b 1
    )
    echo.
    echo %GREEN%Setup complete!%RESET%
    echo.
)

:menu
echo %YELLOW%How are you connecting?%RESET%
echo.
echo   %YELLOW%[1]%RESET% Hotspot        -- npx expo start --offline
echo   %YELLOW%[2]%RESET% Wi-Fi          -- npm start
echo   %YELLOW%[3]%RESET% Other / Tunnel -- npx expo start --tunnel
echo.
set /p "choice=Enter 1, 2, or 3: "

if "%choice%"=="1" set "LAUNCH_CMD=npx expo start --offline" & goto launch
if "%choice%"=="2" set "LAUNCH_CMD=npm start" & goto launch
if "%choice%"=="3" set "LAUNCH_CMD=npx expo start --tunnel" & goto launch

echo.
echo %RED%Please enter 1, 2, or 3.%RESET%
echo.
goto menu

:launch
echo.
echo %GREEN%Starting ChildGuard...%RESET%
echo.
echo   On your phone:
echo   1. Open the Expo Go app
echo   2. Tap "Scan QR Code"
echo   3. Point your camera at the QR code below
echo.
echo Press Ctrl+C to stop the server.
echo.
%LAUNCH_CMD%

endlocal
```

- [ ] **Step 2: Verify the file exists**

```bash
ls -la "Start ChildGuard.bat"
```

Expected: file listed, non-zero size.

- [ ] **Step 3: Commit**

```bash
git add "Start ChildGuard.bat"
git commit -m "feat: add Windows one-click launcher"
```

---

## Task 2: Create the macOS launcher (`Start ChildGuard.command`)

**Files:**
- Create: `Start ChildGuard.command`

- [ ] **Step 1: Create the file with the full script**

Create `Start ChildGuard.command` at the project root with this exact content:

```bash
#!/bin/bash

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║          ChildGuard App Launcher          ║${RESET}"
echo -e "${GREEN}║      Keeping families safe, one scan      ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${RESET}"
echo

if ! command -v node &>/dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed.${RESET}"
    echo
    echo "Please install Node.js from: https://nodejs.org"
    echo "Download the LTS version, run the installer, then launch this file again."
    echo
    read -rp "Press Enter to close..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Setting up for the first time -- this may take a few minutes..."
    echo
    npm install
    if [ $? -ne 0 ]; then
        echo
        echo -e "${RED}Setup failed. Check your internet connection and try again.${RESET}"
        echo
        read -rp "Press Enter to close..."
        exit 1
    fi
    echo
    echo -e "${GREEN}Setup complete!${RESET}"
    echo
fi

while true; do
    echo -e "${YELLOW}How are you connecting?${RESET}"
    echo
    echo -e "  ${YELLOW}[1]${RESET} Hotspot        — npx expo start --offline"
    echo -e "  ${YELLOW}[2]${RESET} Wi-Fi          — npm start"
    echo -e "  ${YELLOW}[3]${RESET} Other / Tunnel — npx expo start --tunnel"
    echo
    read -rp "Enter 1, 2, or 3: " choice
    case $choice in
        1) LAUNCH_CMD="npx expo start --offline"; break ;;
        2) LAUNCH_CMD="npm start"; break ;;
        3) LAUNCH_CMD="npx expo start --tunnel"; break ;;
        *)
            echo
            echo -e "${RED}Please enter 1, 2, or 3.${RESET}"
            echo
            ;;
    esac
done

echo
echo -e "${GREEN}Starting ChildGuard...${RESET}"
echo
echo "  On your phone:"
echo "  1. Open the Expo Go app"
echo '  2. Tap "Scan QR Code"'
echo "  3. Point your camera at the QR code below"
echo
echo "Press Cmd+C to stop the server."
echo

eval "$LAUNCH_CMD"
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x "Start ChildGuard.command"
```

This must be done before the ZIP is created. The execute bit is preserved by macOS's Archive Utility (`zip -r`) and by most Mac-side ZIP tools. If the ZIP was created on Windows, the macOS setup guide must include: `chmod +x "Start ChildGuard.command"` run once in Terminal.

- [ ] **Step 3: Verify permissions**

```bash
ls -la "Start ChildGuard.command"
```

Expected: permissions begin with `-rwxr-xr-x` (or similar with `x` in owner position).

- [ ] **Step 4: Commit**

```bash
git add "Start ChildGuard.command"
git commit -m "feat: add macOS one-click launcher"
```

---

## Task 3: Manual smoke test — Windows

**Files:**
- Test: `Start ChildGuard.bat`

Run these checks on a Windows machine:

- [ ] **Step 1: Test the Node.js missing error path**

Temporarily rename `node.exe` or test on a machine without Node. Double-click `Start ChildGuard.bat`.

Expected: Red error message appears, `https://nodejs.org` is shown, window stays open until Enter/any key.

- [ ] **Step 2: Test the first-run install path**

Rename `node_modules/` to `node_modules_bak/`, then double-click the launcher.

Expected: "Setting up for the first time..." message appears, `npm install` runs, "Setup complete!" message shown, then menu appears.

Restore: rename `node_modules_bak/` back to `node_modules/`.

- [ ] **Step 3: Test invalid menu input**

At the menu, type `5` and press Enter.

Expected: Red "Please enter 1, 2, or 3." message, menu re-displays.

- [ ] **Step 4: Test each valid menu option**

Enter `1` → verify `npx expo start --offline` runs.
Press Ctrl+C, relaunch, enter `2` → verify `npm start` runs.
Press Ctrl+C, relaunch, enter `3` → verify `npx expo start --tunnel` runs.

Expected for each: "Starting ChildGuard..." appears, phone instructions print, Expo QR code displays.

---

## Task 4: Manual smoke test — macOS

**Files:**
- Test: `Start ChildGuard.command`

Run these checks on a macOS machine:

- [ ] **Step 1: Test double-click from Finder (first time)**

Right-click `Start ChildGuard.command` → Open → Open.

Expected: Terminal opens, branded green header appears.

After first approval, subsequent double-clicks open directly without the security prompt.

- [ ] **Step 2: Test the Node.js missing error path**

Temporarily run `which node` and note the path, then test by unsetting PATH in a subshell — or simply test on a machine without Node. Double-click the launcher.

Expected: Red error message, `https://nodejs.org` shown, "Press Enter to close..." prompt.

- [ ] **Step 3: Test the first-run install path**

Rename `node_modules/` to `node_modules_bak/`, then double-click the launcher.

Expected: "Setting up for the first time..." message, `npm install` runs, "Setup complete!" shown, menu appears.

Restore: rename `node_modules_bak/` back to `node_modules/`.

- [ ] **Step 4: Test invalid menu input**

At the menu, type `9` and press Enter.

Expected: Red "Please enter 1, 2, or 3." message, menu re-displays.

- [ ] **Step 5: Test each valid menu option**

Enter `1` → verify `npx expo start --offline` runs.
Cmd+C, relaunch, enter `2` → verify `npm start` runs.
Cmd+C, relaunch, enter `3` → verify `npx expo start --tunnel` runs.

---

## Task 5: Final commit and branch cleanup

- [ ] **Step 1: Verify both files are tracked**

```bash
git status
```

Expected: working tree clean (both files committed in Tasks 1 and 2).

- [ ] **Step 2: Final commit if anything was missed**

If any unstaged changes remain:

```bash
git add "Start ChildGuard.bat" "Start ChildGuard.command"
git commit -m "chore: finalize one-click launchers"
```

- [ ] **Step 3: Open PR or merge per team process**

The feature is on `feature/one-click-launch`. Follow team review process before merging to `main`.
