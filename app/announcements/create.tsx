import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TagSelector } from "@/components/TagSelector";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { announcementService } from "@/services/announcementService";
import { TagId, UserRole } from "@/types";

const defaultAudience: UserRole[] = ["admin", "member", "organiser"];

export default function CreateAnnouncementScreen() {
  const { state, setAnnouncements, setLoading } = useAppContext();
  const user = state.currentUser;
  const canCreateAnnouncements = user?.role === "organiser" || user?.role === "admin";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Event");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagId[]>(user?.interests ?? []);
  const [errorMessage, setErrorMessage] = useState("");

  const orderedTags = useMemo(() => {
    const priorityTagSet = new Set(user?.interests ?? []);

    return [...state.tags].sort((left, right) => {
      const leftPriority = priorityTagSet.has(left.id) ? 0 : 1;
      const rightPriority = priorityTagSet.has(right.id) ? 0 : 1;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.label.localeCompare(right.label);
    });
  }, [state.tags, user?.interests]);

  const toggleTag = (tagId: TagId) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tagId) ? currentTags.filter((currentTag) => currentTag !== tagId) : [...currentTags, tagId]
    );
  };

  const handleCreateAnnouncement = async () => {
    if (!user || !canCreateAnnouncements) {
      return;
    }

    if (!title.trim() || !body.trim()) {
      setErrorMessage("Title and details are required.");
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
        category,
        summary,
        body,
        tags: selectedTags,
        audience: [...defaultAudience],
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
          <Text style={styles.gateTitle}>Log in to create announcements</Text>
          <Text style={styles.gateBody}>Only organiser and admin accounts can publish new announcements.</Text>
          <Pressable onPress={() => router.push("/login" as never)}>
            <Text style={styles.inlineLink}>Go to login</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (!canCreateAnnouncements) {
    return (
      <Screen>
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Access restricted</Text>
          <Text style={styles.gateBody}>Only organisers and admins can create announcements.</Text>
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
          <Text style={styles.title}>Create announcement</Text>
          <Text style={styles.subtitle}>
            Use clear details and relevant tags so members can quickly find announcements that matter to them.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Community town hall"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Event"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Summary (optional)</Text>
          <TextInput
            style={styles.input}
            value={summary}
            onChangeText={setSummary}
            placeholder="Short one-line summary"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Details</Text>
          <TextInput
            style={[styles.input, styles.bodyInput]}
            value={body}
            onChangeText={setBody}
            placeholder="Share full event details"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TagSelector
            title="Related tags"
            helperText="Tags matching your organization interests are listed first."
            tags={orderedTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              disabled={state.isLoading}
              onPress={handleCreateAnnouncement}
              style={[styles.primaryButton, state.isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {state.isLoading ? "Creating announcement..." : "Publish announcement"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
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
  bodyInput: {
    minHeight: 150
  },
  errorText: {
    color: "#9a2f12",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: theme.spacing.md
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
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
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
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
