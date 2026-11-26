import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { resetPassword } from "../../lib/auth";

const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  async function handleReset() {
    if (busy.current) return;
    const address = email.trim().toLowerCase();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Please enter a valid email address.");
      return;
    }
    busy.current = true;
    setLoading(true);
    try {
      await resetPassword(address);
      setSent(true);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "auth/user-not-found") setSent(true);
      else if (code === "auth/too-many-requests") setError("Too many requests. Please try again later.");
      else if (code === "auth/network-request-failed") setError("Check your internet connection and try again.");
      else if (code === "auth/invalid-email") setError("Please enter a valid email address.");
      else setError("Unable to request a password reset. Please try again.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable disabled={loading} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.back}>← Back to login</Text>
          </Pressable>
          <View style={styles.logo}><Text style={styles.heart}>{sent ? "✓" : "♥"}</Text></View>
          <Text style={styles.brand}>LifeMate <Text style={{ color: PURPLE }}>AI</Text></Text>
          <Text style={styles.title}>{sent ? "Check your inbox" : "Forgot password?"}</Text>
          <Text style={styles.subtitle}>{sent ? "If an account exists for this email, you should receive a password reset link. Check your inbox and spam folder." : "Enter your email address to request a secure password reset link."}</Text>
          {!sent && <>
            <Text style={styles.label}>Email address</Text>
            <TextInput style={styles.input} value={email} onChangeText={v => { setEmail(v); setError(""); }} placeholder="Enter your email" placeholderTextColor="#AAA4B8" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!loading} />
            {!!error && <Text style={styles.error}>{error}</Text>}
          </>}
          <Pressable style={[styles.button, loading && { opacity: 0.7 }]} disabled={loading} onPress={sent ? () => router.replace("/(auth)/login") : handleReset}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{sent ? "Return to login" : "Send reset link →"}</Text>}
          </Pressable>
          {sent && <Pressable onPress={() => { setSent(false); setError(""); }}><Text style={styles.retry}>Use another email or request again</Text></Pressable>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBF9FF" },
  container: { flexGrow: 1, padding: 26, justifyContent: "center" },
  back: { color: PURPLE, fontSize: 15, marginBottom: 35 },
  logo: { width: 60, height: 60, borderRadius: 19, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  heart: { color: "white", fontSize: 29 },
  brand: { textAlign: "center", fontSize: 23, fontWeight: "900", color: DARK, marginTop: 12 },
  title: { fontSize: 31, fontWeight: "900", color: DARK, marginTop: 35 },
  subtitle: { color: MUTED, fontSize: 14, lineHeight: 22, marginTop: 9, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "700", color: DARK, marginBottom: 9 },
  input: { height: 55, borderWidth: 1, borderColor: "#E8E1F3", borderRadius: 15, paddingHorizontal: 16, color: DARK, backgroundColor: "white", fontSize: 15 },
  error: { color: "#C43D3D", backgroundColor: "#FFF0F0", padding: 12, borderRadius: 10, marginTop: 12, fontSize: 13 },
  button: { height: 57, backgroundColor: PURPLE, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 30 },
  buttonText: { color: "white", fontWeight: "800", fontSize: 16 },
  retry: { color: PURPLE, textAlign: "center", marginTop: 24, fontWeight: "700" },
});
