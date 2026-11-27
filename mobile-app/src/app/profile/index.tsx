import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);
import { useState } from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  ArrowLeft,
  Pencil,
  LogOut,
  Mail,
  CalendarDays,
  UserRound,
} from "lucide-react-native";

import ProfileAvatar from "../../components/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { logoutUser } from "../../lib/auth";
import { colors } from "../../theme/colors";

export default function ProfileScreen() {
  useTranslation();
  const router = useRouter();
  const { profile, loading } = useProfile();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/more");
    }
  };

  const formatMemberSince = (
    value: string | null
  ) => {
    if (!value) return tr("ui.s106");

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return tr("ui.s106");
    }

    return date.toLocaleDateString(i18n.language, {
      month: "long",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setErrorMessage("");

    try {
      await logoutUser();
      setShowLogout(false);

      // RootLayout handles authentication navigation.
    } catch {
      setErrorMessage(
        tr("ui.s139")
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>{tr("ui.s95")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={tr("common.back")}
        >
          <ArrowLeft
            size={23}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>{tr("ui.s100")}</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile overview */}

        <View style={styles.profileCard}>
          <ProfileAvatar
            name={profile.name}
            size={92}
          />

          <Text style={styles.name}>
            {profile.name || tr("ui.s96")}
          </Text>

          <Text style={styles.email}>
            {profile.email}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push("/profile/edit")
            }
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Pencil size={16} color={colors.white} />

            <Text style={styles.editButtonText}>{tr("ui.s101")}</Text>
          </Pressable>
        </View>

        {/* Personal information */}

        <Text style={styles.sectionTitle}>{tr("ui.s102")}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <UserRound
                size={21}
                color={colors.primaryDark}
              />
            </View>

            <View style={styles.infoDetails}>
              <Text style={styles.label}>{tr("ui.s103")}</Text>

              <Text style={styles.value}>
                {profile.name || tr("ui.s105")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Mail
                size={21}
                color={colors.primaryDark}
              />
            </View>

            <View style={styles.infoDetails}>
              <Text style={styles.label}>{tr("ui.s104")}</Text>

              <Text
                selectable
                style={styles.value}
              >
                {profile.email || tr("ui.s106")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <CalendarDays
                size={21}
                color={colors.primaryDark}
              />
            </View>

            <View style={styles.infoDetails}>
              <Text style={styles.label}>{tr("ui.s107")}</Text>

              <Text style={styles.value}>
                {formatMemberSince(
                  profile.memberSince
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Account section */}

        <Text style={styles.sectionTitle}>{tr("ui.s108")}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setErrorMessage("");
            setShowLogout(true);
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <LogOut size={21} color="#C43D3D" />

          <Text style={styles.logoutText}>{tr("ui.s109")}</Text>
        </Pressable>

        <Text style={styles.footer}>{tr("ui.s111")}</Text>
      </ScrollView>

      {/* Sign-out confirmation */}

      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loggingOut) {
            setShowLogout(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIcon}>
              <LogOut
                size={28}
                color="#C43D3D"
              />
            </View>

            <Text style={styles.modalTitle}>{tr("ui.s110")}</Text>

            <Text style={styles.modalDescription}>{tr("ui.s112")}</Text>

            {errorMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.errorText}
              >
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={loggingOut}
                onPress={() =>
                  setShowLogout(false)
                }
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{tr("ui.s53")}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={loggingOut}
                onPress={handleLogout}
                style={[
                  styles.confirmButton,
                  loggingOut && styles.pressed,
                ]}
              >
                {loggingOut ? (
                  <ActivityIndicator
                    color={colors.white}
                  />
                ) : (
                  <Text style={styles.confirmText}>{tr("ui.s109")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 12,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 14,
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

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: "center",
  },

  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  email: {
    marginTop: 6,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },

  editButton: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 28,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  infoDetails: {
    flex: 1,
    gap: 5,
  },

  label: {
    fontSize: 12,
    color: colors.muted,
  },

  value: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  logoutButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3DADA",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    minHeight: 56,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C43D3D",
  },

  footer: {
    marginTop: 30,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,35,58,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  logoutIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  modalDescription: {
    marginTop: 10,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.lilac,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: colors.text,
    fontWeight: "600",
  },

  confirmButton: {
    flex: 1,
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#C43D3D",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmText: {
    color: colors.white,
    fontWeight: "700",
  },

  errorText: {
    color: "#C43D3D",
    marginTop: 12,
    textAlign: "center",
    fontSize: 13,
  },
});