# LifeMate AI --- Mobile App

This folder contains the LifeMate AI mobile application, built with
Expo, React Native, and TypeScript.

## Requirements

-   Node.js (LTS recommended)
-   npm
-   Expo Go on an Android or iOS device, or an emulator
-   Firebase project configuration
-   A Groq API key if using AI-powered features

## Installation

From this `mobile-app` directory, install dependencies:

``` bash
npm install
```

## Environment Configuration

Create a `.env` file in this directory and add the Firebase
configuration values used by the app:

``` env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

Add any other environment variables required by your local AI or backend
configuration. Use real values only in your local `.env` file.

**Never commit `.env` files, API keys, or other secrets to GitHub.**
Share required variable names with collaborators securely; do not share
secret values in source control.

## Run the App

Start the Expo development server:

``` bash
npx expo start
```

Then scan the QR code with Expo Go, or launch an available emulator from
the Expo CLI.

## Useful Commands

``` bash
# Install dependencies
npm install

# Start Expo
npx expo start

# Start with a cleared Metro cache
npx expo start -c

# Check project health
npx expo-doctor
```

## App Structure

``` text
mobile-app/
├── assets/             # Images, icons, and other static assets
├── scripts/            # Project scripts
├── src/
│   ├── app/            # Expo Router screens and routes
│   ├── lib/            # Firebase and shared service modules
│   └── theme/          # App theme and colors
├── app.json            # Expo app configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

The exact files and folders may change as the application develops.

## Development Notes

-   Use TypeScript for application code.
-   Keep screens and shared services organized under `src/`.
-   Test changes on a device or emulator.
-   Keep credentials in local environment files.
-   Use feature branches and pull requests when collaborating.

For the overall project description and collaboration guidelines, see
the repository's root [`README.md`](../README.md).
