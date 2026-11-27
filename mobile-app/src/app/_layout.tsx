
import { useEffect, useState } from "react";

import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
  usePathname,
} from "expo-router";

import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";

import { auth } from "../lib/firebase";
import { colors } from "../theme/colors";

import {
  PreferencesProvider,
  usePreferences,
} from "../context/PreferencesContext";

import { ProfileProvider } from "../context/ProfileContext";

import {
  changeAppLanguage,
  isSupportedLanguage,
} from "../i18n";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <ProfileProvider key={user?.uid ?? "guest"}>
      <PreferencesProvider uid={user?.uid ?? null}>
        <AppNavigator
          user={user}
          authReady={authReady}
        />
      </PreferencesProvider>
    </ProfileProvider>
  );
}

type NavigatorProps = {
  user: User | null;
  authReady: boolean;
};

function AppNavigator({
  user,
  authReady,
}: NavigatorProps) {
  const { t, i18n } = useTranslation();

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const pathname = usePathname();

  const {
    preferences,
    loading,
    error,
    refreshPreferences,
  } = usePreferences();

  const [appliedLanguageKey, setAppliedLanguageKey] =
    useState<string | null>(null);

  const [languageError, setLanguageError] =
    useState(false);

  const [languageRetry, setLanguageRetry] =
    useState(0);

  const uid = user?.uid ?? null;

  const savedLanguage = preferences?.language;

  const targetLanguage =
    uid &&
    savedLanguage &&
    isSupportedLanguage(savedLanguage)
      ? savedLanguage
      : "en";

  const languageKey = JSON.stringify([
    uid,
    targetLanguage,
    languageRetry,
  ]);

  const languageReady =
    appliedLanguageKey === languageKey;

  // Restore the language after authentication
  // and preferences have finished loading.
  useEffect(() => {
    if (!authReady || loading || error) {
      return;
    }

    let cancelled = false;

    setLanguageError(false);

    async function restoreLanguage() {
      try {
        await changeAppLanguage(targetLanguage);

        if (!cancelled) {
          setAppliedLanguageKey(languageKey);
        }
      } catch (error) {
        console.log("LANGUAGE RESTORE FAILED:", error);

        if (!cancelled) {
          setLanguageError(true);
        }
      }
    }

    void restoreLanguage();

    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    loading,
    error,
    targetLanguage,
    languageKey,
  ]);

  const firstSegment = segments[0];

  const isAuthScreen =
    firstSegment === "(auth)";

  const isOnboardingScreen =
    firstSegment === "(onboarding)";

  const isWelcomeScreen =
    pathname === "/";

  const isPublicScreen =
    isAuthScreen || isWelcomeScreen;

  useEffect(() => {
    if (
      !navigationState?.key ||
      !authReady ||
      loading ||
      error ||
      !languageReady ||
      languageError
    ) {
      return;
    }

    // Logged-out users cannot access protected screens.
    if (!user) {
      if (!isPublicScreen) {
        router.replace("/(auth)/login");
      }

      return;
    }

    // New users must complete onboarding.
    if (!preferences) {
      if (!isOnboardingScreen) {
        router.replace("/(onboarding)/setup");
      }

      return;
    }

    // Returning users should access Home.
    if (isPublicScreen || isOnboardingScreen) {
      router.replace("/(tabs)/home");
    }
  }, [
    navigationState?.key,
    authReady,
    user,
    loading,
    error,
    preferences,
    languageReady,
    languageError,
    isPublicScreen,
    isOnboardingScreen,
    router,
  ]);

  const needsRedirect =
    (!user && !isPublicScreen) ||
    (!!user &&
      !preferences &&
      !isOnboardingScreen) ||
    (!!user &&
      !!preferences &&
      (isPublicScreen || isOnboardingScreen));

  const showLoading =
    !authReady ||
    loading ||
    !languageReady ||
    (!error && needsRedirect);

  const hasError =
    Boolean(error) || languageError;

  const handleRetry = () => {
    if (error) {
      void refreshPreferences();
      return;
    }

    setLanguageError(false);
    setLanguageRetry((previous) => previous + 1);
  };

  return (
    <View style={[styles.root, { direction: i18n.language === "ar" ? "rtl" : "ltr" }]}>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>

      {(showLoading || hasError) && (
        <View style={styles.overlay}>
          <Text style={styles.brand}>
            LifeMate AI
          </Text>

          {hasError ? (
            <>
              <Text style={styles.errorText}>
                {error === "Unable to save your preferences."
                  ? t("onboarding.saveError")
                  : error
                    ? t("onboarding.loadError")
                    : t("common.languageError", {
                        defaultValue:
                          "Unable to restore your language. Please try again.",
                      })}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={handleRetry}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>
                  {t("common.retry")}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator
                size="large"
                color="#8B70D9"
              />

              <Text style={styles.loadingText}>
                {t("common.loading")}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FBF9FF",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FBF9FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 20,
    zIndex: 100,
    elevation: 100,
  },

  brand: {
    fontSize: 30,
    fontWeight: "900",
    color: "#8B70D9",
  },

  loadingText: {
    fontSize: 14,
    color: "#817B96",
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    color: "#C43D3D",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    backgroundColor: "#8B70D9",
    borderRadius: 14,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});
