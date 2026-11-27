import { initializeApp, getApp, getApps } from "firebase/app";

import {
  initializeAuth,
  getAuth,
  type Auth,
  type Persistence,
} from "firebase/auth";

import * as FirebaseAuth from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate Firebase app initialization
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === "web") {
  // Firebase authentication for browser
  auth = getAuth(app);
} else {
  // Firebase authentication for Android and iOS
  const { getReactNativePersistence } =
    FirebaseAuth as typeof FirebaseAuth & {
      getReactNativePersistence: (
        storage: typeof AsyncStorage
      ) => Persistence;
    };

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      (error as { code?: string }).code ===
      "auth/already-initialized"
    ) {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
}

export { app, auth };