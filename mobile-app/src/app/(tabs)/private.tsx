import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);

import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BookOpen,
  Lightbulb,
  CalendarHeart,
  LockKeyhole,
} from "lucide-react-native";

import { usePreferences } from "../../context/PreferencesContext";

export default function PrivateScreen() {
  useTranslation();
  const { preferences } = usePreferences();

  const modules = [
    {
      key: "diary",
      title: tr("features.diary.title"),
      description: tr("features.diary.description"),
      icon: BookOpen,
      enabled: preferences?.features.diary,
    },
    {
      key: "ideaRoom",
      title: tr("features.ideaRoom.title"),
      description: tr("features.ideaRoom.description"),
      icon: Lightbulb,
      enabled: preferences?.features.ideaRoom,
    },
    {
      key: "periodTracker",
      title: tr("features.periodTracker.title"),
      description: tr("features.periodTracker.description"),
      icon: CalendarHeart,
      enabled: preferences?.features.periodTracker,
    },
  ];

  const enabledModules = modules.filter(
    (item) => item.enabled
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{tr("ui.s78")}</Text>

        <Text style={styles.subtitle}>{tr("ui.s79")}</Text>

        <View style={styles.info}>
          <LockKeyhole size={22} color="#8B70D9" />

          <Text style={styles.infoText}>{tr("ui.s80")}</Text>
        </View>

        {enabledModules.map((item) => {
          const Icon = item.icon;

          return (
            <View key={item.key} style={styles.card}>
              <View style={styles.iconBox}>
                <Icon size={25} color="#8B70D9" />
              </View>

              <View style={styles.details}>
                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.description}>
                  {item.description}
                </Text>

                <Text style={styles.status}>{tr("ui.s77")}</Text>
              </View>
            </View>
          );
        })}

        {enabledModules.length === 0 && (
          <View style={styles.empty}>
            <LockKeyhole size={36} color="#8B70D9" />

            <Text style={styles.cardTitle}>{tr("ui.s81")}</Text>

            <Text style={styles.description}>{tr("ui.s82")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF9FF",
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#25213A",
  },
  subtitle: {
    fontSize: 14,
    color: "#817B96",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EAFE",
    borderRadius: 15,
    padding: 15,
    gap: 12,
    marginVertical: 8,
  },
  infoText: {
    flex: 1,
    color: "#625580",
    fontSize: 12,
    lineHeight: 19,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EAE4F3",
    gap: 15,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    color: "#25213A",
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: "#817B96",
    fontSize: 13,
    lineHeight: 20,
  },
  status: {
    color: "#8B70D9",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    gap: 14,
  },
});
