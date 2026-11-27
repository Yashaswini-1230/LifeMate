
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase";

// Optional application features
export type FeaturePreferences = {
  habits: boolean;
  diary: boolean;
  ideaRoom: boolean;
  periodTracker: boolean;
};

// User onboarding preferences
export type UserPreferences = {
  language: string;
  wakeTime: string;
  sleepTime: string;
  activities: string[];
  notifications: boolean;
  sounds: boolean;
  features: FeaturePreferences;
  completedAt: string;
};

// Default feature settings
export const DEFAULT_FEATURES: FeaturePreferences = {
  habits: true,
  diary: false,
  ideaRoom: false,
  periodTracker: false,
};

// Generate a unique storage key for each user
function getPreferencesKey(uid: string): string {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Invalid user session.");
  }

  return `lifemate_preferences_${uid}`;
}

// Save user preferences
export async function savePreferences(
  uid: string,
  preferences: UserPreferences
): Promise<void> {
  const key = getPreferencesKey(uid);

  await AsyncStorage.setItem(
    key,
    JSON.stringify(preferences)
  );
}

// Retrieve user preferences
export async function getPreferences(
  uid: string
): Promise<UserPreferences | null> {
  const key = getPreferencesKey(uid);

  const data = await AsyncStorage.getItem(key);

  if (auth.currentUser?.uid !== uid) {
    throw new Error("User session changed.");
  }

  if (!data) {
    return null;
  }

  const preferences = JSON.parse(data) as UserPreferences;

  if (
    !preferences ||
    typeof preferences.completedAt !== "string" ||
    !preferences.completedAt ||
    !preferences.features
  ) {
    throw new Error("Invalid preferences data.");
  }

  return preferences;
}

// Check whether the user has completed onboarding
export async function hasCompletedOnboarding(
  uid: string
): Promise<boolean> {
  const preferences = await getPreferences(uid);

  return preferences !== null;
}
