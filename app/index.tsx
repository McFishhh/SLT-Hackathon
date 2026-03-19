import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";

export default function HomeScreen() {
  const { state } = useAppContext();
  console.log("HomeScreen rendered");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Community announcement framework</Text>
          <Text style={styles.title}>BigCommunity keeps updates visible, organized, and easy to extend.</Text>
          <Text style={styles.subtitle}>
            Start with a clear structure for registration, persistent data, and cross-page information sharing.
          </Text>

          <Link href="/announcements" style={styles.primaryAction}>
            Browse announcements
          </Link>
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

        <SectionHeader
          title="Current session snapshot"
          subtitle="This demonstrates how user and app variables can be shared cleanly across pages."
        />

        <View style={styles.snapshotCard}>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Active user</Text>
            <Text style={styles.snapshotValue}>{state.currentUser?.displayName ?? "Not signed in"}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Role</Text>
            <Text style={styles.snapshotValue}>{state.currentUser?.role ?? "Not assigned"}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Announcements loaded</Text>
            <Text style={styles.snapshotValue}>{state.announcements.length}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Selected announcement</Text>
            <Text style={styles.snapshotValue}>{state.selectedAnnouncementId ?? "None selected"}</Text>
          </View>
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
    overflow: "hidden",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  grid: {
    gap: theme.spacing.lg
  },
  snapshotCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  snapshotRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  snapshotLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600"
  },
  snapshotValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700"
  }
});
