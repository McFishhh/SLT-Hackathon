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
  const isMember = state.currentUser?.role === "member";

  const filteredAnnouncements = isMember
    ? state.announcements.filter((announcement) => {
        const interestTags = new Set(state.currentUser?.interests ?? []);
        return announcement.tags.some((tag) => interestTags.has(tag));
      })
    : state.announcements;

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

  const handleOpenSettings = () => {
    router.push("/settings" as never);
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
            <Pressable onPress={handleOpenSettings} style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>Settings</Text>
            </Pressable>
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
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>Welcome to BigCommunity</Text>
          <Text style={styles.subtitle}>
            Stay connected with the latest updates, events, and announcements from the community.
          </Text>

          <View style={styles.heroActions}>
            {state.currentUser?.role === "organiser" ? (
              <Pressable onPress={() => router.push("/announcements/create" as never)} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Create announcement</Text>
              </Pressable>
            ) : null}

            {!state.currentUser ? (
              <Link href="/login" style={styles.secondaryAction}>
                Log in
              </Link>
            ) : (
              <Link href="/profile" style={styles.secondaryAction}>
                Profile
              </Link>
            )}
          </View>
        </View>

        <View style={styles.announcementsHeader}>
          <SectionHeader
            title="Announcements"
            subtitle={isMember ? "Showing announcements that match your selected interests." : "See all announcements in one place."}
          />
          {isMember ? (
            <Pressable onPress={() => router.push("/announcements?view=all" as never)}>
              <Text style={styles.showAllLink}>Show all announcements</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.grid}>
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{isMember ? "No matching announcements" : "No announcements yet"}</Text>
              <Text style={styles.emptyBody}>
                {isMember
                  ? "No announcements match your selected tags right now. You can still view everything via Show all announcements."
                  : "There are no announcements available right now."}
              </Text>
            </View>
          )}
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
  settingsButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  settingsButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  hero: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md
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
  heroActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm
  },
  primaryAction: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  primaryActionText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "700"
  },
  partition: {
    backgroundColor: theme.colors.border,
    height: 1,
    width: "100%"
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
  },
  announcementsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  showAllLink: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "700"
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800"
  },
  emptyBody: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
