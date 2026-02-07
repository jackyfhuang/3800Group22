## Techstack
- **Framework:** React Native / Expo (SDK 54) 
- **Routing:** Expo Router
- **State/Forms:** React Hook Form + Zod
- **Testing:** Jest + React Testing Library

**EXPO** because I realized on device rendering requires much higher performance, we needed React Native for performance, Capacitor basically just tricks the device into making a website which then we're limited to JS performance which is dogshit. We can dev for all 3 platforms using typescript. Kotlin also kinda works but multi platform is really jank. 

SideNote: We may need to migrate to SDK55 soonish

A litle bit on EXPO how to use
- Each file is a **Page**
- We **do not** need a master stack navitgator
- Also we don't need to manage tokens

**Zod** is a hook for forms, basically removed a crap ton of if statements. Pretty easy to use just get AI to gen the forms but must make logic first.

**Jest** is industry standard for testing for React Native, since we use expo we don't need docker for env testing which is really nice but downside is that we need E2E testing.

## How to run
Clone the repo 

run ``` npm install ```

run ``` npm start ```

Scan QR Code with iPhone Camera App
- Ensure iPhone and Laptop is on same network 
- Ensure the EXPO GO app is installed

Or Run in web via LocalHost

For Testing ``` npm test ```

Note: App is pretty big, may take a while to clone.
