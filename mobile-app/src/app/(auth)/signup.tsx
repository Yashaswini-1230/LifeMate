import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { signupUser } from "../../lib/auth";

const PURPLE = "#8064D9";
const DARK = "#29233B";
const MUTED = "#827B91";
const BACKGROUND = "#F8F6FC";
const ERROR = "#DC3545";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing details", "Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak password",
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setShowPasswordError(true);
      Alert.alert(
        "Password mismatch",
        "Password does not match. Please check your password.",
      );
      return;
    }

    setShowPasswordError(false);

    if (!acceptedTerms) {
      Alert.alert("Terms required", "Please accept the terms to continue.");
      return;
    }

    try {
      setLoading(true);

      await signupUser(name, email, password);

      router.replace("/(onboarding)");
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered. Please log in.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Please choose a stronger password.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet connection.";
          break;
      }

      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
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
          <Text style={styles.logoText}>♥</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Start building a more balanced life with LifeMate AI.
        </Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#A7A1B2"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#A7A1B2"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="At least 8 characters"
            placeholderTextColor="#A7A1B2"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setShowPasswordError(
                confirmPassword.length > 0 && value !== confirmPassword,
              );
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          style={[
            styles.input,
            (passwordsDoNotMatch || showPasswordError) && styles.inputError,
          ]}
          placeholder="Re-enter your password"
          placeholderTextColor="#A7A1B2"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setShowPasswordError(value.length > 0 && password !== value);
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />

        {(passwordsDoNotMatch || showPasswordError) && (
          <Text style={styles.errorText}>
            Password does not match. Please check your password.
          </Text>
        )}

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checked]}>
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create account →</Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Your personal space. Your better everyday.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 30,
  },
  back: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 28,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 26,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK,
  },
  subtitle: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    color: DARK,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 53,
    borderWidth: 1,
    borderColor: "#E8E2F0",
    borderRadius: 14,
    paddingHorizontal: 15,
    color: DARK,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  inputError: {
    borderColor: ERROR,
  },
  errorText: {
    color: ERROR,
    fontSize: 12,
    marginTop: 7,
    marginLeft: 3,
  },
  passwordContainer: {
    height: 53,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E2F0",
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: DARK,
    fontSize: 14,
  },
  showText: {
    color: PURPLE,
    fontWeight: "700",
    fontSize: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#BDB4CF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  termsText: {
    color: MUTED,
    fontSize: 12,
    flex: 1,
  },
  button: {
    height: 54,
    backgroundColor: PURPLE,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: MUTED,
    fontSize: 13,
  },
  loginLink: {
    color: PURPLE,
    fontWeight: "800",
    fontSize: 13,
  },
  footer: {
    textAlign: "center",
    color: "#A7A1B2",
    fontSize: 11,
    marginTop: 28,
  },
});
