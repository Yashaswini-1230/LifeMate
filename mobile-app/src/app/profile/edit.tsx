import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);
import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  ArrowLeft,
  LockKeyhole,
} from "lucide-react-native";

import ProfileAvatar from "../../components/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { colors } from "../../theme/colors";

export default function EditProfileScreen() {
  useTranslation();
  const router = useRouter();

  const {
    profile,
    loading,
    saving,
    updateName,
  } = useProfile();

  const [name, setName] = useState(
    profile?.name ?? ""
  );

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    setName(profile?.name ?? "");
  }, [profile?.uid, profile?.name]);

  const trimmedName = name.trim();

  const hasChanges =
    trimmedName !== (profile?.name ?? "");

  const canSave =
    !!profile &&
    trimmedName.length > 0 &&
    trimmedName.length <= 60 &&
    hasChanges &&
    !saving;

  const goBack = () => {
    if (saving) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    setErrorMessage("");

    try {
      await updateName(trimmedName);

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/profile");
      }
    } catch (error) {
      const code = (
        error as { code?: string }
      ).code;

      if (
        code === "auth/network-request-failed"
      ) {
        setErrorMessage(
          tr("ui.s143")
        );
      } else if (
        code === "auth/too-many-requests"
      ) {
        setErrorMessage(
          tr("ui.s144")
        );
      } else {
        setErrorMessage(
          tr("ui.s145")
        );
      }
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr("common.back")}
            disabled={saving}
            onPress={goBack}
            style={styles.backButton}
          >
            <ArrowLeft
              size={23}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>{tr("ui.s101")}</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.avatarSection}>
            <ProfileAvatar
              name={name}
              size={90}
            />

            <Text style={styles.title}>{tr("ui.s113")}</Text>

            <Text style={styles.subtitle}>{tr("ui.s114")}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>{tr("ui.s103")}</Text>

            <TextInput
              accessibilityLabel={tr("ui.s103")}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrorMessage("");
              }}
              placeholder={tr("ui.s115")}
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={60}
              editable={!saving}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              style={styles.input}
            />

            <Text style={styles.characterCount}>
              {name.length}/60
            </Text>

            <Text style={styles.label}>{tr("ui.s104")}</Text>

            <View style={styles.readOnlyInput}>
              <Text
                selectable
                style={styles.readOnlyText}
              >
                {profile.email}
              </Text>

              <LockKeyhole
                size={17}
                color={colors.muted}
              />
            </View>

            <Text style={styles.helperText}>{tr("ui.s116")}</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text
                accessibilityLiveRegion="polite"
                style={styles.errorText}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !canSave,
              busy: saving,
            }}
            disabled={!canSave}
            onPress={handleSave}
            style={[
              styles.saveButton,
              !canSave && styles.disabledButton,
            ]}
          >
            {saving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator
                  color={colors.white}
                />

                <Text style={styles.saveText}>{tr("ui.s28")}</Text>
              </View>
            ) : (
              <Text style={styles.saveText}>{tr("ui.s117")}</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={goBack}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>{tr("ui.s53")}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  headerSpacer: {
    width: 48,
  },

  content: {
    padding: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.text,
    marginTop: 18,
  },

  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
  },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },

  input: {
    minHeight: 52,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },

  characterCount: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 24,
  },

  readOnlyInput: {
    minHeight: 52,
    backgroundColor: colors.lilac,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  readOnlyText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
  },

  helperText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    minHeight: 54,
    marginTop: 24,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    backgroundColor: "#AAA2BE",
  },

  saveText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },

  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 8,
    padding: 12,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },

  errorBox: {
    backgroundColor: "#FDECEC",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#C43D3D",
  },
});