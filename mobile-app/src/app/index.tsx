import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Bell,
  Check,
  Heart,
  Mic2,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { colors } from "../theme/colors";

function PreviewTask({
  time,
  title,
  subtitle,
  done = false,
}: {
  time: string;
  title: string;
  subtitle: string;
  done?: boolean;
}) {
  return (
    <View style={styles.taskRow}>
      <Text style={styles.taskTime}>{time}</Text>

      <View style={[styles.taskIcon, done && styles.taskIconDone]}>
        {done ? (
          <Check size={15} color={colors.white} strokeWidth={3} />
        ) : (
          <Sun size={15} color={colors.primaryDark} />
        )}
      </View>

      <View style={styles.taskCopy}>
        <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
          {title}
        </Text>
        <Text style={styles.taskSubtitle}>{subtitle}</Text>
      </View>

      {done && <Text style={styles.doneLabel}>DONE</Text>}
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.brandMark}>
            <Heart size={18} color={colors.white} fill={colors.white} />
          </View>

          <Text style={styles.brandName}>
            LifeMate <Text style={styles.brandAI}>AI</Text>
          </Text>

          <View style={styles.topPill}>
            <Sparkles size={12} color={colors.primaryDark} />
            <Text style={styles.topPillText}>YOUR DAILY COMPANION</Text>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.hero}>
          <View style={styles.eyebrow}>
            <Sparkles size={14} color={colors.primaryDark} />
            <Text style={styles.eyebrowText}>
              A LITTLE MORE BALANCE, EVERY DAY
            </Text>
          </View>

          <Text style={styles.headline}>
            Make space for{"\n"}
            <Text style={styles.headlineAccent}>what matters.</Text>
          </Text>

          <Text style={styles.description}>
            Plan your day, build better habits, and keep your thoughts close —
            all in one thoughtful space.
          </Text>
        </View>

        {/* Daily preview card */}
        <View style={styles.previewWrap}>
          <LinearGradient
            colors={["#EAE2FF", "#F7F2FF", "#F0EAFE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glow}
          />

          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View>
                <Text style={styles.previewOverline}>
                  YOUR DAY, GENTLY ORGANIZED
                </Text>

                <Text style={styles.previewHeading}>
                  Today’s plan <Text style={styles.previewEmoji}>☀️</Text>
                </Text>
              </View>

              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>20</Text>
                <Text style={styles.dateMonth}>NOV</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>1 of 3 activities completed</Text>

            <View style={styles.taskList}>
              <PreviewTask
                time="08:00"
                title="Morning stretch"
                subtitle="A fresh start · 10 min"
                done
              />

              <View style={styles.taskDivider} />

              <PreviewTask
                time="10:30"
                title="Focus time"
                subtitle="Work on what matters"
              />

              <View style={styles.taskDivider} />

              <PreviewTask
                time="18:00"
                title="Evening walk"
                subtitle="Take a little breather"
              />
            </View>

            <View style={styles.aiHint}>
              <Sparkles size={14} color={colors.primaryDark} />
              <Text style={styles.aiHintText}>
                Your day is looking nicely balanced.
              </Text>
            </View>
          </View>

          <View style={styles.floatingMic}>
            <Mic2 size={19} color={colors.white} />
          </View>

          <View style={styles.floatingBell}>
            <Bell size={17} color={colors.primaryDark} />
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Sparkles size={15} color={colors.primaryDark} />
            </View>
            <Text style={styles.benefitText}>AI planning</Text>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Bell size={15} color={colors.primaryDark} />
            </View>
            <Text style={styles.benefitText}>Smart reminders</Text>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <ShieldCheck size={15} color={colors.primaryDark} />
            </View>
            <Text style={styles.benefitText}>Private by design</Text>
          </View>
        </View>

        {/* Footer buttons */}
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(auth)/signup")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get started</Text>
            <ArrowRight size={19} color={colors.white} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(auth)/login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginAccent}>Log in</Text>
            </Text>
          </Pressable>

          <Text style={styles.privacyNote}>
            A calmer day starts with one small step.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  brandAI: {
    color: colors.primary,
  },

  topPill: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.lilac,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
  },

  topPillText: {
    color: colors.primaryDark,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.65,
  },

  hero: {
    marginTop: 27,
  },

  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  eyebrowText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  headline: {
    marginTop: 13,
    color: colors.text,
    fontSize: 39,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.8,
  },

  headlineAccent: {
    color: colors.primary,
  },

  description: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 315,
  },

  previewWrap: {
    flex: 1,
    minHeight: 230,
    maxHeight: 340,
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  glow: {
    position: "absolute",
    width: "100%",
    height: "90%",
    borderRadius: 34,
    transform: [{ rotate: "-4deg" }],
  },

  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    padding: 17,
    marginHorizontal: 7,
    shadowColor: "#7562A6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  previewOverline: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },

  previewHeading: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  previewEmoji: {
    fontSize: 16,
  },

  dateBadge: {
    width: 43,
    height: 48,
    borderRadius: 13,
    backgroundColor: colors.lilac,
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },

  dateMonth: {
    color: colors.primaryDark,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },

  progressTrack: {
    height: 5,
    backgroundColor: "#F0EDF5",
    borderRadius: 8,
    marginTop: 14,
    overflow: "hidden",
  },

  progressFill: {
    width: "34%",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 8,
  },

  progressText: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
  },

  taskList: {
    marginTop: 11,
  },

  taskRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  taskTime: {
    width: 39,
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
  },

  taskIcon: {
    width: 27,
    height: 27,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  taskIconDone: {
    backgroundColor: colors.primary,
  },

  taskCopy: {
    flex: 1,
  },

  taskTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  taskTitleDone: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },

  taskSubtitle: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },

  doneLabel: {
    color: colors.primaryDark,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  taskDivider: {
    height: 1,
    backgroundColor: "#F2EFF7",
    marginLeft: 48,
  },

  aiHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F7F3FF",
    padding: 9,
    borderRadius: 11,
    marginTop: 9,
  },

  aiHintText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: "600",
  },

  floatingMic: {
    position: "absolute",
    right: -1,
    bottom: 20,
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  floatingBell: {
    position: "absolute",
    left: -2,
    top: 24,
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7562A6",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  benefits: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 13,
  },

  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  benefitIcon: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: colors.lilac,
    alignItems: "center",
    justifyContent: "center",
  },

  benefitText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
  },

  footer: {
    gap: 10,
  },

  primaryButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },

  loginButton: {
    alignItems: "center",
    paddingVertical: 2,
  },

  loginText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "500",
  },

  loginAccent: {
    color: colors.primaryDark,
    fontWeight: "800",
  },

  privacyNote: {
    textAlign: "center",
    color: "#A39DAF",
    fontSize: 9,
    marginTop: 1,
  },
});
