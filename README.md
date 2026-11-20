# LifeMate AI — starter screens

This starter contains the first milestone: a lavender-themed Expo Router welcome screen plus temporary sign-up and login destinations so the two buttons work.

## 1. Create the Expo app

From the folder where you want the project:

```bash
npx create-expo-app@latest mobile
cd mobile
```

Choose the default template (it includes Expo Router and TypeScript). If you already created `mobile`, do not create it again.

## 2. Install the screen dependencies

```bash
npx expo install expo-linear-gradient react-native-safe-area-context
npm install lucide-react-native
```

## 3. Copy the starter files

Copy the contents of this bundle's `mobile/app` and `mobile/src` folders into the matching folders in your generated Expo project. If the template already has `app/index.tsx` and `app/_layout.tsx`, replace them with these versions.

## 4. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go if your selected SDK is supported by the installed Expo Go version, or press `a` to open an Android emulator. For native alarm features later, we will move to an Expo development build and test on a physical Android phone.

## What's included

- `app/index.tsx`: responsive welcome screen
- `app/_layout.tsx`: root navigation stack and status bar
- `app/(auth)/login.tsx`: temporary login destination
- `app/(auth)/signup.tsx`: temporary signup destination
- `src/theme/colors.ts`: shared lavender color tokens

## Not included yet

Firebase, AI calls, local database, alarms, voice recognition, and authentication are intentionally not wired in this first UI milestone.
