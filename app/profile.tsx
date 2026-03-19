import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";

export default function ProfileScreen() {
  const { state } = useAppContext();
  const user = state.currentUser;
  const interests = user && user.interests.length > 0 ? user.interests.join(", ") : "No interests set";
  const signedUpEvents =
    user && user.signedUpEventIds.length > 0
      ? state.announcements
          .filter((announcement) => user.signedUpEventIds.includes(announcement.id))
          .map((announcement) => announcement.title)
          .join(", ")
      : "No event signups yet";

  return (
    <Screen scrollEnabled>
      <View style={styles.content}>
        <Text style={styles.title}>Profile and shared user state</Text>
        <Text style={styles.subtitle}>
          This page is intentionally simple so the starter makes it obvious where registration data and role-based access should live.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>
          <Text style={styles.value}>{user?.displayName ?? "Not signed in"}</Text>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role ?? "Not assigned"}</Text>
          <Text style={styles.label}>Interests</Text>
          <Text style={styles.value}>{interests}</Text>
          <Text style={styles.label}>Signed Up Events</Text>
          <Text style={styles.value}>{signedUpEvents}</Text>

          {user ? (
            <Pressable onPress={() => router.push("/settings" as never)} style={styles.settingsLink}>
              <Text style={styles.settingsLinkText}>Open account settings</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "800"
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 700
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: theme.spacing.md
  },
  settingsLink: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  settingsLinkText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "800"
  }
});
