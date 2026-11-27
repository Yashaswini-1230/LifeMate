import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../lib/firebase";
import { DEFAULT_FEATURES, type FeaturePreferences } from "../../lib/preferencesStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import LanguageSelector, {
  getLanguageName,
} from "../../components/LanguageSelector";
import TimeSelector from "../../components/TimeSelector";
import { usePreferences } from "../../context/PreferencesContext";
import { useTranslation } from "react-i18next";
import { changeAppLanguage } from "../../i18n";
const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";
const BG = "#FBF9FF";

const TOTAL_STEPS = 5;
const featureOptions: { key: keyof FeaturePreferences }[] = [
  { key: "habits" },
  { key: "diary" },
  { key: "ideaRoom" },
  { key: "periodTracker" },
];

function normalizeTime(value: string): string | null {
  const match = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]} ${match[3].toUpperCase()}`;
}



const activities = [
  { value: "📚 Studies", key: "studies" },
  { value: "💼 Work", key: "work" },
  { value: "🏋️ Fitness", key: "fitness" },
  { value: "🧘 Meditation", key: "meditation" },
  { value: "💊 Medication", key: "medication" },
  { value: "🎯 Personal goals", key: "goals" },
  { value: "📖 Reading", key: "reading" },
  { value: "🚶 Walking", key: "walking" },
];


export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updatePreferences } = usePreferences();

  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [wakeTime, setWakeTime] = useState("06:00 AM");
  const [sleepTime, setSleepTime] = useState("10:30 PM");

  const [selected, setSelected] = useState<string[]>([]);
  const [features, setFeatures] = useState<FeaturePreferences>({ ...DEFAULT_FEATURES });
  const savingRef = useRef(false);

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleLanguageChange = (code: string) => {
  setLanguage(code);
  setErrorMessage("");
  void changeAppLanguage(code);
};
  const toggleActivity = (activity: string) => {
    setErrorMessage("");

    setSelected((previous) =>
      previous.includes(activity)
        ? previous.filter((item) => item !== activity)
        : [...previous, activity],
    );
  };

  const finish = async () => {
    if (savingRef.current) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      router.replace("/(auth)/login");
      return;
    }
    const wake = normalizeTime(wakeTime);
    const sleep = normalizeTime(sleepTime);
    if (!wake || !sleep || wake === sleep) {
      setStep(1);
      setErrorMessage(t("onboarding.invalidTime"));
      return;
    }
    savingRef.current = true;
    try {
      setSaving(true);
      setErrorMessage("");
      await updatePreferences({
        language, wakeTime: wake, sleepTime: sleep,
        activities: selected, notifications, sounds: notifications && sounds, features,
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.log("ONBOARDING SAVE FAILED:", error);
      setErrorMessage(t("onboarding.saveError"));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (savingRef.current) return;
    setErrorMessage("");
    if (step === 1) {
      const wake = normalizeTime(wakeTime);
      const sleep = normalizeTime(sleepTime);
      if (!wake || !sleep || wake === sleep) {
        setErrorMessage(t("onboarding.invalidTime"));
        return;
      }
      setWakeTime(wake);
      setSleepTime(sleep);
    }
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else void finish();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.top}>
  <Text style={styles.brand}>
    LifeMate <Text style={{ color: PURPLE }}>AI</Text>
  </Text>

            <Text style={styles.stepText}>
              {t("onboarding.progress", {
                current: step + 1,
                total: TOTAL_STEPS,
              })}
            </Text>
          </View>
          <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.emoji}>{["🌍", "🌅", "✨", "🧩", "🔔"][step]}</Text>

        {/* <Text style={styles.title}>
          {
            [
              "Choose your language",
              "Your daily routine",
              "What matters to you?",
              "Make LifeMate yours",
              "Stay connected",
            ][step]
          }
        </Text>

        <Text style={styles.subtitle}>
          {
            [
              "Choose your preferred language for your LifeMate experience.",
              "Tell us when your day usually begins and ends.",
              "Select your interests, or continue without selecting any.",
              "Choose the optional features you want to use.",
              "Customize how LifeMate reminds you throughout the day.",
            ][step]
          }
        </Text> */}

        <Text style={styles.title}>
          {t(`onboarding.titles.${step}`)}
        </Text>

        <Text style={styles.subtitle}>
          {t(`onboarding.subtitles.${step}`)}
        </Text>

        {step === 0 && (
          <LanguageSelector
            value={language}
            onChange={handleLanguageChange}
          />
        )}

        
{step === 1 && (
  <View style={styles.section}>
    <TimeSelector
      label={t("onboarding.wakeTime")}
      value={wakeTime}
      onChange={(time) => {
        setWakeTime(time);
        setErrorMessage("");
      }}
    />

    <TimeSelector
      label={t("onboarding.sleepTime")}
      value={sleepTime}
      onChange={(time) => {
        setSleepTime(time);
        setErrorMessage("");
      }}
    />

    <Text style={styles.hint}>
      {t("onboarding.routineHint")}
    </Text>
  </View>
)}

        
{step === 2 && (
  <View style={styles.activities}>
    {activities.map((item) => (
      <Pressable
        key={item.key}
        style={[
          styles.activity,
          selected.includes(item.value) &&
            styles.selectedOption,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: selected.includes(item.value),
        }}
        onPress={() => toggleActivity(item.value)}
      >
        <Text style={styles.activityText}>
          {t(`activities.${item.key}`)}
        </Text>

        <Text style={styles.check}>
          {selected.includes(item.value) ? "✓" : "+"}
        </Text>
      </Pressable>
    ))}
  </View>
)}


        
{step === 3 && (
  <View style={styles.section}>
    {featureOptions.map((item) => (
      <View key={item.key} style={styles.preference}>
        <View style={{ flex: 1 }}>
          <Text style={styles.preferenceTitle}>
            {t(`features.${item.key}.title`)}
          </Text>

          <Text style={styles.hint}>
            {t(`features.${item.key}.description`)}
          </Text>
        </View>

        <Switch
          accessibilityLabel={
            t(`features.${item.key}.title`)
          }
          value={features[item.key]}
          onValueChange={(value) =>
            setFeatures((previous) => ({
              ...previous,
              [item.key]: value,
            }))
          }
          trackColor={{ true: PURPLE }}
        />
      </View>
    ))}

    <Text style={styles.hint}>
      {t("onboarding.featureHint")}
    </Text>
  </View>
)}


        
{step === 4 && (
  <View style={styles.section}>
    <View style={styles.preference}>
      <View style={{ flex: 1 }}>
        <Text style={styles.preferenceTitle}>
          {t("onboarding.notifications")}
        </Text>

        <Text style={styles.hint}>
          {t("onboarding.notificationDescription")}
        </Text>
      </View>

      <Switch
        accessibilityLabel={t("onboarding.notifications")}
        value={notifications}
        disabled={saving}
        onValueChange={setNotifications}
        trackColor={{ true: PURPLE }}
      />
    </View>

    <View style={styles.preference}>
      <View style={{ flex: 1 }}>
        <Text style={styles.preferenceTitle}>
          {t("onboarding.sounds")}
        </Text>

        <Text style={styles.hint}>
          {t("onboarding.soundDescription")}
        </Text>
      </View>

      <Switch
        accessibilityLabel={t("onboarding.sounds")}
        value={notifications && sounds}
        disabled={saving || !notifications}
        onValueChange={setSounds}
        trackColor={{ true: PURPLE }}
      />
    </View>

    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>
        {t("onboarding.summary")}
      </Text>

      <Text style={styles.summaryText}>
        {t("onboarding.summaryLanguage", {
          name: getLanguageName(language),
        })}
      </Text>

      <Text style={styles.summaryText}>
        {t("onboarding.summaryWake", {
          time: wakeTime,
        })}
      </Text>

      <Text style={styles.summaryText}>
        {t("onboarding.summarySleep", {
          time: sleepTime,
        })}
      </Text>

      <Text style={styles.summaryText}>
        {t("onboarding.summaryActivities", {
          count: selected.length,
        })}
      </Text>

      <Text style={styles.summaryText}>
        {t("onboarding.summaryFeatures", {
          count: Object.values(features).filter(Boolean).length,
        })}
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
              <Text style={styles.backText}>
                {t("common.back")}
              </Text>
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
                {step === 4
                  ? t("common.finish")
                  : t("common.continue")}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>
            {t("onboarding.footer")}
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
  gap: 12,
},
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: DARK,
  },
  stepText: {
  flexShrink: 1,
  textAlign: "right",
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
  minHeight: 64,
  gap: 8,
},
  activityText: {
  flex: 1,
  flexShrink: 1,
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
  textAlign: "center",
},
  footer: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 15,
  },
});
