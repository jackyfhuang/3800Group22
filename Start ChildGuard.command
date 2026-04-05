#!/bin/bash

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║        ChildGuard  App  Launcher         ║${RESET}"
echo -e "${GREEN}║    Keeping families safe, one scan.      ║${RESET}"
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

echo
echo "Server stopped. Press Enter to close this window."
read -rp ""
