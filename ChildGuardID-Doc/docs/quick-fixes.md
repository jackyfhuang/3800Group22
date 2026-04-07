---
sidebar_position: 3
title: Quick Fixes
---

# <h1 style={{ textAlign: 'center' }}>Quick Fixes</h1>

## Network and Connectivity

Since Expo relies on the phone and computer "talking" to each other, network firewalls are the most common hurdle.

**Pitfall 1: The QR code is scanned, but the phone shows "Request Timed Out" or "No connection could be made."**

> **Cause:** The computer's firewall is blocking Expo, or the phone and computer are on different Wi-Fi bands (e.g., one on 2.4 GHz and the other on 5 GHz).
    
- **Solution 1:** Run the demo online. Refer to [Running the Demo Online](./manual-setup#running-the-demo)

- **Solution 2:** Ensure both devices are connected to the exact same Wi-Fi or hotspot, then [follow the proper commands](./manual-setup#running-the-demo)

- **Solution 3:** Temporarily disable any active VPN

---

**Pitfall 2: The tunnel command fails with an "Ngrok" error.**
    
> **Cause:** The tunneling dependency is not installed globally.

- **Solution:** In Command Prompt or Terminal, navigate to your project folder and run:
```
npm install -g @expo/ngrok
``` 
Then try again with:
```
npx expo start --tunnel
```
You can [follow these steps for reference](./manual-setup#navigating-to-the-project)

___

## Environment & Installation

Your machine may not have all the required tools installed.

**Pitfall 1: The command `npm` is not recognized**

> **Cause:** Node.js is not installed on your machine.

- **Solution:** Visit [Node.js](https://nodejs.org/en/download), scroll to the bottom, and download the appropriate installer: `Windows Installer (.msi)` or `macOS Installer (.pkg)`. Then try again.

:::info 
*NOTE: You may need to restart your machine after installation.*
:::

---

**Pitfall 2: "Module not found" or "Missing dependencies."**

> **Cause:** You may have skipped the `npm install` step or moved the project folder, which broke the dependencies.

- **Solution:** Delete the `node_modules` folder and run:
```npm install```
Make sure you have [navigated to your project folder](./manual-setup#navigating-to-the-project) before running the command.

___

## Cleaning the Cache

> If the app feels "stuck" or is showing outdated data from a previous test:

**Solution:** In Command Prompt or Terminal, press `Shift + C`. This clears the project cache and forces the phone to download a fresh version of the app.