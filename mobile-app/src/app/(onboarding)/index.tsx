import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";
const BG = "#FBF9FF";

const PREFERENCES_KEY = "lifemate_onboarding_preferences";

const languages = ["English", "తెలుగు", "हिन्दी"];

const activities = [
  "📚 Studies",
  "💼 Work",
  "🏋️ Fitness",
  "🧘 Meditation",
  "💊 Medication",
  "🎯 Personal goals",
  "📖 Reading",
  "🚶 Walking",
];

export default function OnboardingScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("English");
  const [wakeTime, setWakeTime] = useState("06:00 AM");
  const [sleepTime, setSleepTime] = useState("10:30 PM");

  const [selected, setSelected] = useState<string[]>([
    "📚 Studies",
    "🏋️ Fitness",
  ]);

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleActivity = (activity: string) => {
    setErrorMessage("");

    setSelected((previous) =>
      previous.includes(activity)
        ? previous.filter((item) => item !== activity)
        : [...previous, activity],
    );
  };

  const finish = async () => {
    if (selected.length === 0) {
      setErrorMessage("Please select at least one activity.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const preferences = {
        language,
        wakeTime,
        sleepTime,
        activities: selected,
        notifications,
        sounds,
        completedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));

      router.replace("/home");
    } catch (error) {
      console.log("ONBOARDING SAVE FAILED:", error);

      setErrorMessage("Unable to save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    setErrorMessage("");

    if (step === 2 && selected.length === 0) {
      setErrorMessage("Please select at least one activity.");
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <Text style={styles.brand}>
            LifeMate <Text style={{ color: PURPLE }}>AI</Text>
          </Text>

          <Text style={styles.stepText}>STEP {step + 1} OF 4</Text>
        </View>

        <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / 4) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.emoji}>{["🌍", "🌅", "✨", "🔔"][step]}</Text>

        <Text style={styles.title}>
          {
            [
              "Choose your language",
              "Your daily routine",
              "What matters to you?",
              "Stay connected",
            ][step]
          }
        </Text>

        <Text style={styles.subtitle}>
          {
            [
              "Choose your preferred language for your LifeMate experience.",
              "Tell us when your day usually begins and ends.",
              "Select the activities you want to organize and track.",
              "Customize how LifeMate reminds you throughout the day.",
            ][step]
          }
        </Text>

        {step === 0 && (
          <View style={styles.section}>
            {languages.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.option,
                  language === item && styles.selectedOption,
                ]}
                onPress={() => setLanguage(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
                <Text style={styles.check}>
                  {language === item ? "✓" : "○"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.label}>🌞 Wake-up time</Text>

            <TextInput
              style={styles.input}
              value={wakeTime}
              onChangeText={setWakeTime}
              placeholder="06:00 AM"
              placeholderTextColor="#A7A1B2"
            />

            <Text style={styles.label}>🌙 Sleep time</Text>

            <TextInput
              style={styles.input}
              value={sleepTime}
              onChangeText={setSleepTime}
              placeholder="10:30 PM"
              placeholderTextColor="#A7A1B2"
            />

            <Text style={styles.hint}>
              You can change these timings anytime in Settings.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.activities}>
            {activities.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.activity,
                  selected.includes(item) && styles.selectedOption,
                ]}
                onPress={() => toggleActivity(item)}
              >
                <Text style={styles.activityText}>{item}</Text>

                <Text style={styles.check}>
                  {selected.includes(item) ? "✓" : "+"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <View style={styles.preference}>
              <View style={{ flex: 1 }}>
                <Text style={styles.preferenceTitle}>Smart notifications</Text>

                <Text style={styles.hint}>
                  Receive reminders for scheduled activities.
                </Text>
              </View>

              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: PURPLE }}
              />
            </View>

            <View style={styles.preference}>
              <View style={{ flex: 1 }}>
                <Text style={styles.preferenceTitle}>Reminder sounds</Text>

                <Text style={styles.hint}>
                  Play sounds when reminders arrive.
                </Text>
              </View>

              <Switch
                value={sounds}
                onValueChange={setSounds}
                trackColor={{ true: PURPLE }}
              />
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Your LifeMate setup</Text>

              <Text style={styles.summaryText}>Language: {language}</Text>

              <Text style={styles.summaryText}>Wake up: {wakeTime}</Text>

              <Text style={styles.summaryText}>Sleep: {sleepTime}</Text>

              <Text style={styles.summaryText}>
                Activities: {selected.length} selected
              </Text>
            </View>
          </View>
        )}

        {errorMessage !== "" && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.buttons}>
          {step > 0 && (
            <Pressable
              style={styles.backButton}
              onPress={() => {
                setErrorMessage("");
                setStep(step - 1);
              }}
              disabled={saving}
            >
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.nextButton, saving && styles.disabledButton]}
            onPress={handleContinue}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextText}>
                {step === 3 ? "Finish setup ✓" : "Continue →"}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>
          You can personalize these preferences anytime.
        </Text>
      </ScrollView>
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
    padding: 25,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: DARK,
  },
  stepText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: "800",
  },
  progress: {
    height: 7,
    backgroundColor: "#EDE7F8",
    borderRadius: 10,
    marginTop: 25,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    backgroundColor: PURPLE,
    borderRadius: 10,
  },
  emoji: {
    fontSize: 43,
    marginTop: 38,
  },
  title: {
    fontSize: 29,
    fontWeight: "900",
    color: DARK,
    marginTop: 18,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
    marginTop: 10,
    marginBottom: 28,
  },
  section: {
    gap: 16,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 19,
    borderWidth: 1,
    borderColor: "#EAE4F3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#F0EAFE",
    borderColor: PURPLE,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  check: {
    color: PURPLE,
    fontWeight: "900",
    fontSize: 19,
  },
  label: {
    color: DARK,
    fontWeight: "800",
    fontSize: 14,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    backgroundColor: "white",
    paddingHorizontal: 16,
    color: DARK,
    fontSize: 16,
  },
  hint: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
  },
  activities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activity: {
    width: "47%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityText: {
    color: DARK,
    fontSize: 12,
    fontWeight: "700",
  },
  preference: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EAE4F3",
  },
  preferenceTitle: {
    color: DARK,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 5,
  },
  summary: {
    backgroundColor: "#F0EAFE",
    padding: 18,
    borderRadius: 16,
    gap: 9,
  },
  summaryTitle: {
    color: DARK,
    fontWeight: "900",
    fontSize: 15,
  },
  summaryText: {
    color: MUTED,
    fontSize: 13,
  },
  errorContainer: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  errorText: {
    color: "#C43D3D",
    fontSize: 12,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 35,
  },
  backButton: {
    padding: 17,
    borderRadius: 15,
    backgroundColor: "#EFEAF8",
  },
  backText: {
    color: PURPLE,
    fontWeight: "800",
  },
  nextButton: {
    flex: 1,
    backgroundColor: PURPLE,
    padding: 17,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 55,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
  footer: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 15,
  },
});
