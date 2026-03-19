import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { Announcement } from "@/types";

type AnnouncementCardProps = {
  announcement: Announcement;
  showSummary?: boolean;
};

export function AnnouncementCard({ announcement, showSummary = false }: AnnouncementCardProps) {
  const { setSelectedAnnouncement, state } = useAppContext();
  const tagLabelMap = useMemo(() => new Map(state.tags.map((tag) => [tag.id, tag.label])), [state.tags]);

  return (
    <Link
      href={{
        pathname: "/announcements/[id]",
        params: { id: announcement.id }
      }}
      asChild
    >
      <Pressable
        onPress={() => setSelectedAnnouncement(announcement.id)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.topRow}>
          <Text style={styles.category}>{announcement.category}</Text>
          <Text style={styles.date}>{announcement.publishedAt}</Text>
        </View>

        <Text style={styles.title}>{announcement.title}</Text>

        <View style={styles.tagRow}>
          {announcement.tags.map((tagId) => (
            <Text key={tagId} style={styles.tagChip}>
              {tagLabelMap.get(tagId) ?? tagId}
            </Text>
          ))}
        </View>

        {showSummary ? <Text style={styles.summary}>{announcement.summary}</Text> : null}

        <View style={styles.footer}>
          <Text style={styles.author}>By {announcement.authorName}</Text>
          <Text style={styles.linkText}>Read more</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }]
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  category: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    textTransform: "uppercase"
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs
  },
  tagChip: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  summary: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 23
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  author: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600"
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "800"
  }
});
