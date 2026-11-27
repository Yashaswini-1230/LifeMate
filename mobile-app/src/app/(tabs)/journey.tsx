import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);

import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChartNoAxesCombined } from "lucide-react-native";

export default function JourneyScreen() {
  useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{tr("ui.s73")}</Text>

      <Text style={styles.subtitle}>{tr("ui.s74")}</Text>

      <View style={styles.card}>
        <ChartNoAxesCombined size={38} color="#8B70D9" />

        <Text style={styles.cardTitle}>{tr("ui.s75")}</Text>

        <Text style={styles.description}>{tr("ui.s76")}</Text>

        <Text style={styles.status}>{tr("ui.s77")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF9FF",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#25213A",
  },
  subtitle: {
    color: "#817B96",
    fontSize: 14,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginTop: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#EAE4F3",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#25213A",
  },
  description: {
    fontSize: 14,
    color: "#817B96",
    textAlign: "center",
    lineHeight: 22,
  },
  status: {
    color: "#8B70D9",
    fontWeight: "600",
  },
});
