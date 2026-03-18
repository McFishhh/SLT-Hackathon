import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { availableTags } from "@/data/tagOptions";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { announcementService } from "@/services/announcementService";
import { useEffect, useMemo, useState } from "react";
import { Announcement } from "@/types";

export default function ProfileScreen() {
  const { state } = useAppContext();
  const user = state.currentUser;
  const [matchedAnnouncements, setMatchedAnnouncements] = useState<Announcement[]>([]);

  const tagLabelMap = useMemo(() => new Map(availableTags.map((tag) => [tag.id, tag.label])), []);

  const interests =
    user && user.interests.length > 0
      ? user.interests.map((tagId) => tagLabelMap.get(tagId) ?? tagId).join(", ")
      : "No interests set";

  useEffect(() => {
    let isMounted = true;

    announcementService.listTagMatchedAnnouncementsForUser(user, state.announcements).then((announcements) => {
      if (isMounted) {
        setMatchedAnnouncements(announcements);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [state.announcements, user]);

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
          <Text style={styles.label}>Matching event notifications</Text>
          <Text style={styles.value}>
            {user
              ? matchedAnnouncements.length > 0
                ? matchedAnnouncements.map((announcement) => announcement.title).join("\n")
                : "No matching announcements yet"
              : "Sign in to see matched notifications"}
          </Text>
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
  }
});
