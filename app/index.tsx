import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { roleOptions } from "@/data/tagOptions";
import { authService } from "@/services/authService";

export default function HomeScreen() {
  const { state, setCurrentUser, setLoading } = useAppContext();
  console.log("HomeScreen rendered");

  const privilegeLabel = state.currentUser
    ? roleOptions.find((option) => option.value === state.currentUser?.role)?.label ?? "Member"
    : "";

  const privilegeBadgeStyle =
    state.currentUser?.role === "admin"
      ? styles.privilegeBadgeAdmin
      : state.currentUser?.role === "organiser"
      ? styles.privilegeBadgeOrganiser
      : styles.privilegeBadgeMember;

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logoutUser();
      setCurrentUser(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {state.currentUser ? (
          <View style={styles.userRow}>
            <View style={[styles.privilegeBadge, privilegeBadgeStyle]}>
              <Text style={styles.privilegeBadgeText}>{privilegeLabel}</Text>
            </View>
            <Text style={styles.userName}>{state.currentUser.displayName}</Text>
            <Pressable
              disabled={state.isLoading}
              onPress={handleLogout}
              style={[styles.logoutButton, state.isLoading && styles.logoutButtonDisabled]}
            >
              <Text style={styles.logoutButtonText}>{state.isLoading ? "Logging out..." : "Log Out"}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Community announcement framework</Text>
          <Text style={styles.title}>BigCommunity keeps updates visible, organized, and easy to extend.</Text>
          <Text style={styles.subtitle}>
            Start with a clear structure for registration, persistent data, and cross-page information sharing.
          </Text>

          <View style={styles.heroActions}>
            <Link href="/announcements" style={styles.primaryAction}>
              Browse announcements
            </Link>

            {!state.currentUser ? (
              <Link href="/login" style={styles.secondaryAction}>
                Log in
              </Link>
            ) : null}
          </View>
        </View>

        <SectionHeader
          title="Featured announcements"
          subtitle="These cards are driven by typed data and can later be sourced from Firestore."
        />

        <View style={styles.grid}>
          {state.announcements.slice(0, 3).map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl
  },
  userRow: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  privilegeBadge: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  privilegeBadgeAdmin: {
    backgroundColor: "#fde8e8",
    borderColor: "#f8b4b4"
  },
  privilegeBadgeMember: {
    backgroundColor: "#e8f8ec",
    borderColor: "#b4e2bf"
  },
  privilegeBadgeOrganiser: {
    backgroundColor: "#e8f1ff",
    borderColor: "#b8d3ff"
  },
  privilegeBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700"
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  logoutButtonDisabled: {
    opacity: 0.72
  },
  logoutButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  hero: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.xl
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 720
  },
  primaryAction: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 44,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    textAlign: "center"
  },
  heroActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm
  },
  secondaryAction: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 44,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    textAlign: "center"
  },
  grid: {
    gap: theme.spacing.lg
  }
});
