---
sidebar_position: 2
title: One-Click Launch
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# <h1 style={{ textAlign: 'center' }}>One-Click Launch</h1>

This is the preferred and easiest way to start the **ChildGuardID** demo. The automated script handles the technical setup in the background so you can jump straight into the application.

---

## Installation

To run this application, you will first need to download [Node.js](https://nodejs.org/en/download). Scroll to the bottom of the page and select the appropriate installer for your machine: `Windows Installer (.msi)` or `macOS Installer (.pkg)`. Follow the installation instructions, then return to this guide once completed.

---

## Run ChildGuardID

### Step 1: Locate the Project Folder

Open the folder named `ChildGuardID` that you saved to your machine.

### Step 2: Run the Launch Script

<Tabs>
    <TabItem value="Windows" label="Windows" default>
    > Inside the folder, locate a file named `Start ChildGuard.bat`. Double-click it to launch the application.
    </TabItem>
    <TabItem value="macOS" label="macOS">
    > Inside the folder, locate a file named `Start ChildGuard.command`. Double-click it to launch the application.
    </TabItem>
</Tabs>

### Step 3: Wait for Initialization

A black window (the Command Center) will appear. **Do not close this window.** It is preparing the "virtual phone" for you. This may take 1–2 minutes depending on your internet speed.

Once fully loaded, follow the on-screen instructions to generate a QR code for your demo.

### Step 4: Scan the QR Code with the Expo Go App

> Open the **Expo Go** app and scan the QR code.

:::success Launched and Running!
Once setup is complete and the QR code has been scanned, the demo will open on your phone, launching the ChildGuardID application.
:::

:::warning Troubleshooting the Launch
If the window closes immediately or displays an error message, please proceed to the [**Manual Fail-Safe**](./manual-setup) section of this guide.
:::