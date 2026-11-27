import { useState } from "react";
import LanguageSelector from "../../components/LanguageSelector";
import { usePreferences } from "../../context/PreferencesContext";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  Settings,
  LayoutGrid,
  Bell,
  ShieldCheck,
  CircleHelp,
  ChevronRight,
} from "lucide-react-native";

import ProfileAvatar from "../../components/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { colors } from "../../theme/colors";

const getMenuItems = () => [
  {
    title: tr("ui.s83"),
    description: tr("ui.s84"),
    icon: LayoutGrid,
  },
  {
    title: tr("ui.s85"),
    description: tr("ui.s86"),
    icon: Settings,
  },
  {
    title: tr("ui.s87"),
    description: tr("ui.s88"),
    icon: Bell,
  },
  {
    title: tr("ui.s89"),
    description: tr("ui.s90"),
    icon: ShieldCheck,
  },
  {
    title: tr("ui.s91"),
    description: tr("ui.s92"),
    icon: CircleHelp,
  },
];

export default function MoreScreen() {
  useTranslation();
  const router = useRouter();
  const menuItems = getMenuItems();
  const { preferences, updatePreferences } = usePreferences();
  const [showLanguage, setShowLanguage] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState(preferences?.language ?? "en");
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageError, setLanguageError] = useState(false);
  const saveLanguage = async () => {
    if (!preferences || savingLanguage) return;
    setSavingLanguage(true);
    setLanguageError(false);
    try {
      await updatePreferences({ ...preferences, language: draftLanguage });
      setShowLanguage(false);
    } catch { setLanguageError(true); }
    finally { setSavingLanguage(false); }
  };
  const { profile, loading } = useProfile();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>{tr("tabs.more")}</Text>

        <Text style={styles.subtitle}>{tr("ui.s93")}</Text>

        {/* Profile card */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("ui.s94")}
          disabled={loading || !profile}
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [
            styles.profileCard,
            pressed && styles.pressed,
          ]}
        >
          <ProfileAvatar
            name={profile?.name}
            size={58}
          />

          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {loading
                ? tr("ui.s95")
                : profile?.name || tr("ui.s96")}
            </Text>

            <Text
              style={styles.profileEmail}
              numberOfLines={1}
            >
              {profile?.email || ""}
            </Text>

            <Text style={styles.viewProfile}>{tr("ui.s97")}</Text>
          </View>

          <ChevronRight
            size={22}
            color={colors.muted}
          />
        </Pressable>

        {/* Settings section */}

        <Text style={styles.sectionTitle}>{tr("ui.s98")}</Text>

        <View style={styles.menu}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Pressable
                disabled={index !== 1 || !preferences || savingLanguage}
                onPress={() => { setDraftLanguage(preferences?.language ?? "en"); setShowLanguage(v => !v); }}
                key={index}
                style={[
                  styles.item,
                  index === menuItems.length - 1 &&
                    styles.lastItem,
                ]}
              >
                <View style={styles.iconBox}>
                  <Icon
                    size={22}
                    color={colors.primaryDark}
                  />
                </View>

                <View style={styles.details}>
                  <Text style={styles.itemTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.description}>
                    {item.description}
                  </Text>

                  {index !== 1 && <Text style={styles.comingSoon}>{tr("ui.s77")}</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {showLanguage && <View style={{ gap: 12, padding: 16, backgroundColor: colors.surface, borderRadius: 16 }}>
          <Text style={styles.sectionTitle}>{tr("onboarding.titles.0")}</Text>
          <LanguageSelector value={draftLanguage} onChange={setDraftLanguage} />
          {languageError && <Text style={{color: "#C43D3D"}}>{tr("onboarding.saveError")}</Text>}
          <Pressable disabled={savingLanguage} onPress={saveLanguage} style={{padding: 14, borderRadius: 12, backgroundColor: colors.primaryDark}}>
            <Text style={{color: colors.white, textAlign: "center", fontWeight: "700"}}>{savingLanguage ? tr("ui.s28") : tr("ui.s117")}</Text>
          </Pressable>
          <Pressable disabled={savingLanguage} onPress={() => setShowLanguage(false)}><Text style={{textAlign: "center", color: colors.primaryDark}}>{tr("ui.s53")}</Text></Pressable>
        </View>}
        <Text style={styles.footer}>{tr("ui.s99")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 24,
    gap: 14,
  },

  profileDetails: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  profileEmail: {
    fontSize: 12,
    color: colors.muted,
  },

  viewProfile: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryDark,
    marginTop: 3,
  },

  pressed: {
    opacity: 0.75,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 28,
    marginBottom: 12,
  },

  menu: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  details: {
    flex: 1,
    gap: 4,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  description: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },

  comingSoon: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 2,
  },

  footer: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 12,
    marginTop: 28,
  },
});