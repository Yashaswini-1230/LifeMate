import { useTranslation } from "react-i18next";
import i18n from "../i18n";
const tr = (key: string) => i18n.t(key);

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";

const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";

type Props = {
  label: string;
  value: string;
  onChange: (time: string) => void;
};

function parseTime(value: string): Date {
  const date = new Date();

  const match = value
    .trim()
    .match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i);

  if (!match) {
    date.setHours(6, 0, 0, 0);
    return date;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  hours = hours % 12;

  if (period === "PM") {
    hours += 12;
  }

  date.setHours(hours, minutes, 0, 0);

  return date;
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? "PM" : "AM";

  const displayHours = String(
    hours % 12 || 12
  ).padStart(2, "0");

  const displayMinutes = String(minutes).padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${period}`;
}

export default function TimeSelector({
  label,
  value,
  onChange,
}: Props) {
  useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === "web" ? (
        <TextInput
          style={styles.webInput}
          value={value}
          onChangeText={onChange}
          placeholder="06:00 AM"
          placeholderTextColor={MUTED}
          autoCapitalize="characters"
        />
      ) : (
        <Pressable
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${value}`}
        >
          <Text style={styles.timeText}>{value}</Text>

          <Clock size={22} color={PURPLE} />
        </Pressable>
      )}

      {showPicker && Platform.OS !== "web" && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={parseTime(value)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            is24Hour={false}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") {
                setShowPicker(false);
              }

              if (event.type === "set" && selectedDate) {
                onChange(formatTime(selectedDate));
              }

              if (event.type === "dismissed") {
                setShowPicker(false);
              }
            }}
          />

          {Platform.OS === "ios" && (
            <Pressable
              style={styles.doneButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.doneText}>{tr("common.done")}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  label: {
    color: DARK,
    fontSize: 14,
    fontWeight: "800",
  },

  timeButton: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeText: {
    fontSize: 17,
    fontWeight: "600",
    color: DARK,
  },

  webInput: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    paddingHorizontal: 17,
    color: DARK,
    fontSize: 16,
  },

  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
  },

  doneButton: {
    alignItems: "center",
    padding: 14,
  },

  doneText: {
    color: PURPLE,
    fontSize: 15,
    fontWeight: "700",
  },
});
