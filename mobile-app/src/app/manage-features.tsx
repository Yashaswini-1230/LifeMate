import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  ArrowLeft,
  Flame,
  BookOpen,
  Lightbulb,
  CalendarHeart,
  ShieldCheck,
} from "lucide-react-native";

import { usePreferences } from "../context/PreferencesContext";
import type { FeaturePreferences } from "../lib/preferencesStorage";
import { colors } from "../theme/colors";

const featureItems = [
  {
    key: "habits",
    icon: Flame,
    color: "#E89048",
  },
  {
    key: "diary",
    icon: BookOpen,
    color: "#8B70D6",
  },
  {
    key: "ideaRoom",
    icon: Lightbulb,
    color: "#C99B39",
  },
  {
    key: "periodTracker",
    icon: CalendarHeart,
    color: "#D9799B",
  },
] as const;

export default function ManageFeaturesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { preferences, updatePreferences } =
    usePreferences();

  const [draft, setDraft] =
    useState<FeaturePreferences | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const features = draft ?? preferences?.features;

  const hasChanges =
    !!features &&
    !!preferences &&
    featureItems.some(
      ({ key }) =>
        features[key] !== preferences.features[key]
    );

  const goBack = () => {
    if (saving) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/more");
    }
  };

  const toggleFeature = (
    key: keyof FeaturePreferences,
    value: boolean
  ) => {
    if (!features || saving) return;

    setError(false);

    setDraft({
      ...features,
      [key]: value,
    });
  };

  const saveFeatures = async () => {
    if (
      !preferences ||
      !features ||
      !hasChanges ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setError(false);

    try {
      await updatePreferences({
        ...preferences,
        features: { ...features },
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/more");
      }
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={styles.backButton}
        >
          <ArrowLeft
            size={23}
            color={colors.primaryDark}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          {t("ui.s83")}
        </Text>
      </View>

      {!features ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.subtitle}>
            {t("common.loading")}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>
              {t("ui.s83")}
            </Text>

            <Text style={styles.subtitle}>
              {t("ui.s84")}
            </Text>

            <View style={styles.featureList}>
              {featureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <View
                    key={item.key}
                    style={styles.featureCard}
                  >
                    <View style={styles.iconBox}>
                      <Icon
                        size={25}
                        color={item.color}
                      />
                    </View>

                    <View style={styles.featureDetails}>
                      <Text style={styles.featureTitle}>
                        {t(`features.${item.key}.title`)}
                      </Text>

                      <Text style={styles.description}>
                        {t(
                          `features.${item.key}.description`
                        )}
                      </Text>
                    </View>

                    <Switch
                      value={features[item.key]}
                      disabled={saving}
                      onValueChange={(value) =>
                        toggleFeature(item.key, value)
                      }
                      accessibilityLabel={t(
                        `features.${item.key}.title`
                      )}
                      trackColor={{
                        false: "#DCD8E3",
                        true: colors.primary,
                      }}
                      thumbColor={colors.white}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.infoCard}>
              <ShieldCheck
                size={22}
                color={colors.primaryDark}
              />

              <Text style={styles.infoText}>
                {t("manageFeatures.dataSafety")}
              </Text>
            </View>

            {error && (
              <Text
                style={styles.error}
                accessibilityRole="alert"
              >
                {t("ui.s141")}. {t("ui.s118")}
              </Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={!hasChanges || saving}
              onPress={saveFeatures}
              style={[
                styles.saveButton,
                (!hasChanges || saving) &&
                  styles.disabledButton,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveText}>
                  {t("ui.s117")}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={goBack}
              disabled={saving}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>
                {t("ui.s53")}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },

  featureList: {
    marginTop: 24,
    gap: 12,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },

  featureDetails: {
    flex: 1,
    flexShrink: 1,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 5,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 15,
    padding: 15,
    marginTop: 22,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.primaryDark,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "500",
  },

  error: {
    color: "#B42318",
    fontSize: 13,
    marginTop: 16,
    lineHeight: 20,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});