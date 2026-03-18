import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { announcementService } from "@/services/announcementService";
import { Announcement } from "@/types";

export default function AnnouncementsScreen() {
  const { state } = useAppContext();
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>(state.announcements);
  const [matchedAnnouncements, setMatchedAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      announcementService.listAnnouncementsForUser(state.currentUser, state.announcements),
      announcementService.listTagMatchedAnnouncementsForUser(state.currentUser, state.announcements)
    ]).then(([roleVisible, tagMatched]) => {
      if (isMounted) {
        setVisibleAnnouncements(roleVisible);
        setMatchedAnnouncements(tagMatched);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [state.announcements, state.currentUser]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>
            A simple, scalable listing page for community-wide updates, notices, and event messages.
          </Text>
        </View>

        {state.currentUser ? (
          <View style={styles.list}>
            <Text style={styles.sectionTitle}>Matched for your tags</Text>
            {matchedAnnouncements.length > 0 ? (
              matchedAnnouncements.map((announcement) => (
                <AnnouncementCard key={`matched-${announcement.id}`} announcement={announcement} showSummary />
              ))
            ) : (
              <Text style={styles.emptyText}>No matching event notifications yet for your current tag selections.</Text>
            )}
          </View>
        ) : null}

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>All announcements</Text>
          {visibleAnnouncements.map((announcement) => (
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
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  list: {
    gap: theme.spacing.lg
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
