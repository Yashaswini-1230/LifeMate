import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { loginUser } from "../../lib/auth";

const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";
const BG = "#FBF9FF";
const ERROR = "#DC3545";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email.trim(), password);

      router.replace("/home");
    } catch (error: any) {
      console.log("LOGIN FAILED:", error?.code, error?.message);

      const code = error?.code || "";

      if (
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setErrorMessage(
          "Incorrect password or email. Please check your credentials and try again.",
        );
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Too many login attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        setErrorMessage(
          "Network error. Please check your internet connection.",
        );
      } else if (code === "auth/user-disabled") {
        setErrorMessage("This account has been disabled.");
      } else {
        setErrorMessage(
          "Login failed. Please check your email and password and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>

          <View style={styles.logo}>
            <Text style={styles.heart}>♥</Text>
          </View>

          <Text style={styles.brand}>
            LifeMate <Text style={{ color: PURPLE }}>AI</Text>
          </Text>

          <Text style={styles.title}>Welcome back!</Text>

          <Text style={styles.subtitle}>
            Your little steps towards a balanced life continue here.
          </Text>

          <Text style={styles.label}>Email address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#AAA4B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage("");
            }}
          />

          <Text style={styles.label}>Password</Text>

          <View style={[styles.passwordBox, errorMessage && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#AAA4B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage("");
              }}
              autoCapitalize="none"
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.show}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          {errorMessage !== "" && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>ⓘ</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.options}>
            <Pressable onPress={() => setRemember(!remember)}>
              <Text style={styles.remember}>
                {remember ? "☑" : "□"} Remember me
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setErrorMessage("Password reset will be available soon.")
              }
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log in →</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.line} />
          </View>

          <Pressable
            style={styles.google}
            onPress={() =>
              setErrorMessage("Google sign-in will be available soon.")
            }
          >
            <Text style={styles.googleText}>G Continue with Google</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>

            <Pressable onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.link}>Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flexGrow: 1,
    padding: 26,
    justifyContent: "center",
  },
  back: {
    color: PURPLE,
    fontSize: 15,
    marginBottom: 35,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  heart: {
    color: "white",
    fontSize: 29,
  },
  brand: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "900",
    color: DARK,
    marginTop: 12,
  },
  title: {
    fontSize: 31,
    fontWeight: "900",
    color: DARK,
    marginTop: 35,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
    marginBottom: 9,
    marginTop: 17,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E8E1F3",
    borderRadius: 15,
    paddingHorizontal: 16,
    color: DARK,
    backgroundColor: "white",
    fontSize: 15,
  },
  passwordBox: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E8E1F3",
    borderRadius: 15,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: DARK,
    fontSize: 15,
  },
  inputError: {
    borderColor: ERROR,
  },
  show: {
    color: PURPLE,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF0F0",
    borderRadius: 10,
    padding: 11,
    marginTop: 10,
    gap: 8,
  },
  errorIcon: {
    color: ERROR,
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    color: ERROR,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  remember: {
    color: MUTED,
    fontSize: 12,
  },
  forgot: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "700",
  },
  button: {
    height: 57,
    backgroundColor: PURPLE,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E1F3",
  },
  or: {
    color: MUTED,
    fontSize: 12,
  },
  google: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8E1F3",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  googleText: {
    color: DARK,
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },
  footerText: {
    color: MUTED,
    fontSize: 13,
  },
  link: {
    color: PURPLE,
    fontWeight: "800",
    fontSize: 13,
  },
});
