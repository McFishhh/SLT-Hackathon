import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";

export default function AnnouncementsScreen() {
  const { state } = useAppContext();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>
            A simple, scalable listing page for community-wide updates, notices, and event messages.
          </Text>

          {state.currentUser?.role === "organiser" ? (
            <Pressable onPress={() => router.push("/announcements/create" as never)} style={styles.createButton}>
              <Text style={styles.createButtonText}>Create announcement</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.list}>
          {state.announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} showSummary />
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
  header: {
    gap: theme.spacing.sm
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
    maxWidth: 720
  },
  createButton: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  createButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  list: {
    gap: theme.spacing.lg
  }
});
