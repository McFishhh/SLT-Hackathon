import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TagSelector } from "@/components/TagSelector";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { availableTags } from "@/data/tagOptions";
import { announcementService } from "@/services/announcementService";

export default function CreateAnnouncementScreen() {
  const { state, setAnnouncements, setLoading } = useAppContext();
  const user = state.currentUser;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(user?.interests ?? []);
  const [errorMessage, setErrorMessage] = useState("");

  const orderedTags = useMemo(() => {
    const priorityTagSet = new Set(user?.interests ?? []);
    return [...availableTags].sort((left, right) => {
      const leftPriority = priorityTagSet.has(left.id) ? 0 : 1;
      const rightPriority = priorityTagSet.has(right.id) ? 0 : 1;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.label.localeCompare(right.label);
    });
  }, [user?.interests]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tagId) ? currentTags.filter((currentTag) => currentTag !== tagId) : [...currentTags, tagId]
    );
  };

  const handleCreateAnnouncement = async () => {
    if (!user || user.role !== "organiser") {
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Add both a title and a description.");
      return;
    }

    if (selectedTags.length === 0) {
      setErrorMessage("Select at least one related tag.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const createdAnnouncement = await announcementService.createAnnouncement({
        title,
        description,
        tags: selectedTags,
        authorName: user.displayName
      });

      const announcements = await announcementService.listAnnouncements();
      setAnnouncements(announcements);
      router.replace({
        pathname: "/announcements/[id]",
        params: { id: createdAnnouncement.id }
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create the announcement right now.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Log in as an organiser</Text>
          <Text style={styles.gateBody}>Only organiser accounts can create announcements.</Text>
          <Pressable onPress={() => router.push("/login" as never)}>
            <Text style={styles.inlineLink}>Go to login</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (user.role !== "organiser") {
    return (
      <Screen>
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Organiser access required</Text>
          <Text style={styles.gateBody}>Switch to an organiser account to create announcements.</Text>
          <Pressable onPress={() => router.push("/announcements" as never)}>
            <Text style={styles.inlineLink}>Back to announcements</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollEnabled>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Organizer tools</Text>
          <Text style={styles.title}>Create an announcement</Text>
          <Text style={styles.subtitle}>
            Your organization tags appear first, but you can choose any available tag for this announcement.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Announcement title</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Example: Family Wellness Screening Day"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={title}
          />

          <Text style={styles.label}>Announcement description</Text>
          <TextInput
            multiline
            numberOfLines={6}
            onChangeText={setDescription}
            placeholder="Add the key details participants need to know."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.descriptionInput]}
            textAlignVertical="top"
            value={description}
          />

          <TagSelector
            title="Related tags"
            helperText="Tags represented by your organization are listed first."
            tags={orderedTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            disabled={state.isLoading}
            onPress={handleCreateAnnouncement}
            style={[styles.primaryButton, state.isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>
              {state.isLoading ? "Creating announcement..." : "Create announcement"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    gap: theme.spacing.xl,
    maxWidth: 760,
    width: "100%"
  },
  header: {
    gap: theme.spacing.sm
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.xl
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: theme.spacing.sm
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  descriptionInput: {
    minHeight: 150
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  buttonDisabled: {
    opacity: 0.72
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  errorText: {
    color: "#9a2f12",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: theme.spacing.md
  },
  gateCard: {
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    maxWidth: 680,
    padding: theme.spacing.xl,
    width: "100%"
  },
  gateTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800"
  },
  gateBody: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24
  },
  inlineLink: {
    alignSelf: "flex-start",
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: "800"
  }
});
