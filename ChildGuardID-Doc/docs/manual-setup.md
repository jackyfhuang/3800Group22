---
sidebar_position: 3
title: Manual Setup (Fail-Safe)
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import useBaseUrl from '@docusaurus/useBaseUrl';

# <h1 style={{textAlign: 'center'}}>Manual Setup</h1>

If the **Launch_Demo.bat** script does not start the app automatically, please follow these step-by-step instructions. This "Fail-Safe" method ensures you can still view and test the ChildGuardID application.

---

### Navigating to the project
<Tabs>
  <TabItem value="win" label="Windows Instruction">
    #### 1. Open Command Prompt
    Press the **Windows Key**, type `cmd`, and press **Enter**.

    #### 2. Navigate to the Project
    Type the following and press **Enter:**
    ```
    cd Desktop\ChildGuardID
    ```
    
    :::caution Important: Finding your Project Folder
    These instructions assume your folder is saved on your Desktop. If you saved it somewhere else, follow these three simple steps to "tell" the computer where it is:

    1. Open your project folder in the regular Windows File Explorer (where you see your files).

    2. Click the address bar at the very top of the window (the bar that shows the folder name). The text will turn blue. Right-click it and select Copy.
    <div align="center">
        <img src={useBaseUrl("/img/project_folder_navigation.png")} width="400" alt="project folder navigation" />
    </div>
    _**NOTE:** The example project folder here is called `3800Group22`. Yours will be `ChildGuardID`_
    
    3. Go back to the Command Prompt, type cd followed by a Space, then Right-click to paste that location and press Enter.
    
    <div align="center">
        <img src={useBaseUrl('/img/cmd_dir_path.png')} width="400" alt="Command prompt directory" />
    </div>
    :::

  </TabItem>
  <TabItem value="mac" label="macOS Instruction">
    #### 1. Open the Terminal 
    Pressing Command `⌘` + `Space Bar` to open Spotlight Search. Type `Terminal` and press Enter.
    
    #### 2. Navigate to the Project 
    Type the following and press **Enter:**
    ```
    cd ~/Desktop/ChildGuardID
    ```

    :::caution Important: Finding your Project Folder (Mac)
    These instructions assume your folder is saved on your **Desktop**. If you saved it somewhere else, follow these steps to "tell" the computer where it is:

    1. **Open your folder** in the regular Mac **Finder** (the blue smiley face icon where you see your files).

    2. **The "Drag & Drop" Shortcut (Easiest):**
   * Go to your Terminal window and type `cd` followed by a **Space**.
   * Go back to your Finder window, click and hold the **ChildGuardID folder icon**, and drag it directly into the Terminal window.
   * The computer will automatically type the entire folder path for you! Press **Enter**.

3. **Alternative "Copy Path" Method:**
   * Right-click (or Control-click) your **ChildGuardID** folder in Finder.
   * Hold down the **Option (⌥)** key on your keyboard. You will see "Copy" change to **"Copy 'ChildGuardID' as Pathname"**. Click that.
   * Go back to the Terminal, type `cd`, and press **Command + V** to paste, then press **Enter**.

    _**NOTE:** If your Terminal shows a name like `3800Group22` instead of `ChildGuardID`, that is okay! As long as the command starts with `cd`, you are in the right place._
    :::
  </TabItem>
</Tabs>

---

### Running the Demo
Once you have successfully navigated to the project folder, using the Command Prompt / Terminal you need to *"start the engine"* for the app and connect your phone. Choose the option that matches your current internet setup:

<Tabs>
    <TabItem value="Standard" label="Same Wi-Fi" default>
        #### If your computer and phone are on the same Wi-Fi network
        1. Ensure all devices are on the same Wi-Fi network
        2. In your Command Prompt / Terminal, run this command:
        ```
        npm start
        ```
    </TabItem>
    <TabItem value="hot_spot" label="Hot Spot">
        #### If your computer and phone are connecting via Hot-Spot
        1. Ensure all devices are on the same Hot-Spot network
        2. In your Command Prompt / Terminal, run the command: 
        ```
        npx expo start --offline
        ```
    </TabItem>
    <TabItem value="Online" label="Online">
        #### If your computer and phone are on different networks
        While the other options require the phone and computer to be "talking" to each other on the same local network, the tunnel mode uses a service (usually Ngrok) to create a secure, public entry point
        
        #### Remote Demo
        In your Command Prompt / Terminal:
        
        1. First you will need to install a package. Run the command: 
        ```
        npm install -g @expo/ngrok
        ```
        
        2. Then run:
        ```
        npx expo start --tunnel
        ```
        
        :::caution Considerations

        **Speed:** Because the data is traveling to a server and back, the app might take an extra 30–60 seconds to load compared to the "Hot-Spot" or "Wi-Fi" methods

        **Reliability:** If you are on a university Wi-Fi, a corporate network, or using a VPN, they often block "Tunnels" because they look like a security hole
        :::
    </TabItem>
</Tabs>
:::tip Success
    This might take a while to load. Once finished loading, a large QR Code will appear. Open your Expo Go app, scan the code, and the app will open!
    
    ***NOTE:** You will not need to create an account to scan and demo the app*
:::