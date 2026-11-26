import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { colors } from "../theme/colors";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // Protect application routes
  useEffect(() => {
    if (!authReady) return;

    const firstSegment = segments[0];
    const secondSegment = segments[1];

    const isAuthScreen = firstSegment === "(auth)";

    const isWelcomeScreen =
      pathname === "/" && firstSegment !== "(onboarding)";

const isProtectedScreen =
  firstSegment === "home" ||
  firstSegment === "schedule" ||
  firstSegment === "explore" ||
  firstSegment === "(onboarding)";

    if (!user && isProtectedScreen) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && isWelcomeScreen)  {
      router.replace("/home");
      return;
    }

    // A logged-in user who opens onboarding can continue setup.
    // A logged-out user cannot access onboarding.
  }, [user, authReady, segments, pathname]);

  // Wait until Firebase restores the authentication session
  if (!authReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark"/>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: "fade",
        }}
      />
    </>
  );
}
