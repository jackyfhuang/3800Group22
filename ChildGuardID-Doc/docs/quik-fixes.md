---
sidebar_position: 3
title: Quick Fixes
---
# <h1 style={{textAlign: 'center'}}>Quick Fixes</h1>

## Network and Connectivity
Since Expo relies on the phone and computer "talking" to each other, network firewalls are the most common hurdle.

### Pitfalls Scenarios  
**Pitfall 1. The QR code is scanned, but the phone says "Request Timed Out" or "No connection could be made."**

> **Cause:** The computer's Firewall is blocking Expo, or the phone and laptop are on different Wi-Fi bands (e.g., one on 2.4GHz and one on 5GHz).
    
- **Solution 1)** Run the demo online. Go to [Running the Demo Online](./manual-setup#running-the-demo) for reference

- **Solution 2)** Ensure both devices are on the exact same Wi-Fi / Hot-Spot and [follow the proper commands](manual-setup#running-the-demo)

- **Solution 3)** Temporary fix: Turn off the VPN if one is active

**Pitfall 2. The Tunnel command fails with a "Ngrok" error.**
    
> **Cause:** the project doesn't have the tunneling dependency installed globally yet

- **Solution:** Using the Command Prompt / Terminal, navigate to your project, run `npm install -g @expo/ngrok` and try again with `npx expo start --tunnel`. [Follow these steps for reference](./manual-setup#navigating-to-the-project)

___
## Environment & Installation
You may not have everything you need

**Pitfall 1. The command npm is not recognized**
> **Cause:** Node.js is not installed on your machine
- **Solution:** Follow the [Link](https://nodejs.org/en/download), scroll to the bottom and download `Windows installer (.msi)` or `macOS Installer(.pkg)`. Then try again. 

:::info 
    *NOTE: you make need to restart your machine after installing*
:::

**Pitfall 2. "Module not found" or "Missing dependencies."**

> **Cause:** May have skipped the `npm install` step or moved the folder and broke the links

- **Solution:** Delete the node_modules folder and run `npm install`. Follow these steps to [navigate to your project](manual-setup#navigating-to-the-project) before running the command above

___
## Cleaning the "Cache"
>If the app feels "stuck" or is showing old data from a previous test:

**Solution** In the Command prompt / Terminal on the computer, press `Shift` + `C`. This clears the project cache and forces the phone to download a fresh, clean version of the app.