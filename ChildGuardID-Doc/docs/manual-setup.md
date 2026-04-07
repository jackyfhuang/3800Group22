---
sidebar_position: 3
title: Manual Setup (Fail-Safe)
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import useBaseUrl from '@docusaurus/useBaseUrl';

# <h1 style={{ textAlign: 'center' }}>Manual Setup</h1>

If the **Launch_Demo.bat** script does not start the app automatically, please follow these step-by-step instructions. This "fail-safe" method ensures you can still view and test the ChildGuardID application.

---

### Navigating to the Project

<Tabs>
  <TabItem value="win" label="Windows Instructions">
    #### 1. Open Command Prompt
    Press the **Windows key**, type `cmd`, and press **Enter**.

    #### 2. Navigate to the Project
    Type the following and press **Enter:**
    ```
    cd Desktop\ChildGuardID
    ```
    
    :::caution Important: Finding Your Project Folder
    These instructions assume your folder is saved on your Desktop. If you saved it somewhere else, follow these steps to "tell" the computer where it is:

    1. Open your project folder in Windows File Explorer.

    2. Click the address bar at the top of the window (where the folder path is shown). The text will turn blue. Right-click it and select **Copy**.

    <div align="center">
        <img src={useBaseUrl("/img/project_folder_navigation.png")} width="400" alt="project folder navigation" />
    </div>

    _**NOTE:** The example project folder here is called `3800Group22`. Yours will be `ChildGuardID`._
    
    3. Return to Command Prompt, type `cd` followed by a space, then right-click to paste the location and press **Enter**.
    
    <div align="center">
        <img src={useBaseUrl('/img/cmd_dir_path.png')} width="400" alt="Command prompt directory" />
    </div>
    :::

  </TabItem>

  <TabItem value="mac" label="macOS Instructions">
    #### 1. Open Terminal 
    Press **Command (⌘) + Space** to open Spotlight Search. Type `Terminal` and press **Enter**.
    
    #### 2. Navigate to the Project 
    Type the following and press **Enter:**
    ```
    cd ~/Desktop/ChildGuardID
    ```

    :::caution Important: Finding Your Project Folder (Mac)
    These instructions assume your folder is saved on your **Desktop**. If you saved it somewhere else, follow these steps:

    1. Open your folder in **Finder** (the blue smiley face icon).

    2. **Drag & Drop Method (Easiest):**
   * In Terminal, type `cd` followed by a **space**.
   * Go back to Finder, click and hold the **ChildGuardID folder**, and drag it into the Terminal window.
   * The full folder path will be inserted automatically. Press **Enter**.

    3. **Alternative "Copy Path" Method:**
   * Right-click (or Control-click) the **ChildGuardID** folder in Finder.
   * Hold the **Option (⌥)** key. “Copy” will change to **"Copy 'ChildGuardID' as Pathname"**. Click it.
   * Return to Terminal, type `cd`, press **Command + V** to paste, then press **Enter**.

    _**NOTE:** If your Terminal shows a name like `3800Group22` instead of `ChildGuardID`, that is okay. As long as the command starts with `cd`, you are in the correct location._
    :::

  </TabItem>
</Tabs>

---

### Running the Demo

Once you have successfully navigated to the project folder using Command Prompt or Terminal, you need to *"start the engine"* for the app and connect your phone. Choose the option that matches your network setup:

<Tabs>
    <TabItem value="Standard" label="Same Wi-Fi" default>
        #### If your computer and phone are on the same Wi-Fi network
        1. Ensure all devices are connected to the same Wi-Fi network.
        2. In Command Prompt or Terminal, run:
        ```
        npm start
        ```
    </TabItem>

    <TabItem value="hot_spot" label="Hot Spot">
        #### If your computer and phone are connected via a Hotspot
        1. Ensure all devices are connected to the same hotspot.
        2. In Command Prompt or Terminal, run:
        ```
        npx expo start --offline
        ```
    </TabItem>

    <TabItem value="Online" label="Online">
        #### If your computer and phone are on different networks

        The tunnel mode allows devices to connect over the internet using a secure public endpoint (typically via Ngrok).

        #### Remote Demo

        In Command Prompt or Terminal:

        1. Install the required package:
        ```
        npm install -g @expo/ngrok
        ```
        
        2. Then run:
        ```
        npx expo start --tunnel
        ```
        
        :::caution Considerations

        **Speed:** Because data travels through an external server, the app may take an extra 30–60 seconds to load compared to the "Hotspot" or "Wi-Fi" methods.

        **Reliability:** Some university networks, corporate networks, or VPNs may block tunnels because they can appear as security risks.
        :::
    </TabItem>
</Tabs>

:::tip Success
This may take some time to load. Once finished, a large QR code will appear. Open the Expo Go app, scan the code, and the app will launch.

***NOTE:** You do not need to create an account to scan and demo the app.*
:::