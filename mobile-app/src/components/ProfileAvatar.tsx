import { useTranslation } from "react-i18next";
import i18n from "../i18n";
const tr = (key: string) => i18n.t(key);
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { UserRound } from "lucide-react-native";
import { colors } from "../theme/colors";

type ProfileAvatarProps = {
  name?: string | null;
  size?: number;
  onPress?: () => void;
};

export default function ProfileAvatar({
  name,
  size = 44,
  onPress,
}: ProfileAvatarProps) {
  useTranslation();
  const trimmedName = name?.trim() ?? "";

  const initial = trimmedName
    ? Array.from(trimmedName)[0].toUpperCase()
    : "";

  const avatar = (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {initial ? (
        <Text
          numberOfLines={1}
          style={[
            styles.initial,
            {
              fontSize: size * 0.42,
            },
          ]}
        >
          {initial}
        </Text>
      ) : (
        <UserRound
          size={size * 0.48}
          color={colors.primaryDark}
        />
      )}
    </View>
  );

  if (!onPress) {
    return avatar;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("ui.s94")}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      {avatar}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lavender,
    overflow: "hidden",
  },

  initial: {
    color: colors.primaryDark,
    fontWeight: "700",
  },

  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.75,
  },
});