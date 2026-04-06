---
sidebar_position: 2
title: One-Click Launch
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# <h1 style={{textAlign: 'center'}}>One-Click Launch</h1>

This is the preferred and easiest way to start the **ChildGuardID** demo. Our automated script handles the technical setup in the background so you can jump straight into the application.

---
## Installation
To run this application, you will first need to download [Node.js](https://nodejs.org/en/download). Scroll to the bottom and pick the appropriate installer for your machine `Widows Installer (.msi)` or `macOS Installer (.pkg)`. Follow their instructions, and when you are finished return back to this guide.
___
## Run ChildGuardID

### Step 1: Locate the Project Folder
Open the folder named `ChildGuardID` that you saved to your machine.

### Step 2: Run the Launch Script
<Tabs>
    <TabItem value="Windows" label="Windows" default>
    > Inside the folder, look for a file named `Start ChildGuard.bat`. Double click it to launch the application
    </TabItem>
    <TabItem value="macOS" label="macOS">
    > Inside the folder, look for a file named `Start ChildGuard.command`. Double click it to launch the application
    </TabItem>
</Tabs>

<!-- <div align="center">
  <img src="/img/folderView.png" width="500" alt="Folder View" />
  <p><i>Look for the file with the gear icon labeled "Launch_Demo".</i></p>
</div> -->

### Step 3: Wait for Initialization
A black window (the Command Center) will appear. **Do not close this window.** It is preparing the "Virtual Phone" for you. This may take 1-2 minutes depending on your internet speed.

Once fully loaded, following the instruction to start and receive a QR code for your demo


### Step 4: Scan the QR code with your Expo App
> open up the Expo Go app and scan the QR code

:::success Launched and Running!
When the setup is complete, and the QR code has been scanned, the demo will appear on your phone that will be opening up the ChildGuardID application
:::

:::warning Troubleshooting the Launch
If the window closes immediately or shows an error message, please proceed to the [**Manual Fail-Safe**](./Manual-Setup) section of this guide.
:::