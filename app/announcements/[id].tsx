import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

import { Screen } from "@/components/Screen";
import { availableTags } from "@/data/tagOptions";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useAppContext();
  const tagLabelMap = useMemo(() => new Map(availableTags.map((tag) => [tag.id, tag.label])), []);

  const announcement = state.announcements.find((item) => item.id === id);

  if (!announcement) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Announcement not found</Text>
          <Text style={styles.emptyBody}>This route is ready for dynamic data, but the requested item does not exist yet.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollEnabled>
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{announcement.category}</Text>
          <Text style={styles.meta}>{announcement.publishedAt}</Text>
        </View>

        <View style={styles.tagRow}>
          {announcement.tags.map((tag) => (
            <Text key={tag} style={styles.tagChip}>
              {tagLabelMap.get(tag) ?? tag}
            </Text>
          ))}
        </View>

        <Text style={styles.title}>{announcement.title}</Text>
        <Text style={styles.summary}>{announcement.summary}</Text>

        <View style={styles.bodyCard}>
          <Text style={styles.body}>{announcement.body}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Created by</Text>
          <Text style={styles.infoValue}>{announcement.authorName}</Text>
          <Text style={styles.infoLabel}>Audience</Text>
          <Text style={styles.infoValue}>{announcement.audience.join(", ")}</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  badge: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: 14
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  tagChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  summary: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 25
  },
  bodyCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.spacing.lg
  },
  body: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 26
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: theme.spacing.sm
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.xl
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800"
  },
  emptyBody: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24
  }
});
