import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Screen } from "@/components/Screen";
import { TagSelector } from "@/components/TagSelector";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { Announcement, AnnouncementInput, TagId } from "@/types";

function announcementToDraft(announcement: Announcement): AnnouncementInput {
  return {
    title: announcement.title,
    summary: announcement.summary,
    body: announcement.body,
    category: announcement.category,
    audience: [...announcement.audience],
    tags: [...announcement.tags]
  };
}

export default function AnnouncementsScreen() {
  const { state, updateAnnouncement, deleteAnnouncement } = useAppContext();
  const role = state.currentUser?.role;
  const canCreateAnnouncements = role === "organiser" || role === "admin";
  const canAdminManageAnnouncements = role === "admin";

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AnnouncementInput | null>(null);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const visibleAnnouncements = state.announcements;
  const pageSubtitle = canAdminManageAnnouncements
    ? "Admins can edit and delete any announcement while managing associated tags."
    : "See all community announcements in one place.";

  const toggleEditTag = (tagId: TagId) => {
    setEditDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        tags: currentDraft.tags.includes(tagId)
          ? currentDraft.tags.filter((currentTag) => currentTag !== tagId)
          : [...currentDraft.tags, tagId]
      };
    });
  };

  const startEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setEditDraft(announcementToDraft(announcement));
    setFormError("");
    setFormMessage("Editing selected announcement");
  };

  const resetForm = () => {
    setEditingAnnouncementId(null);
    setEditDraft(null);
  };

  const handleSubmitAnnouncementEdit = () => {
    if (!editingAnnouncementId || !editDraft) {
      return;
    }

    if (!editDraft.title.trim() || !editDraft.summary.trim() || !editDraft.body.trim()) {
      setFormError("Title, summary, and body are required.");
      return;
    }

    if (editDraft.tags.length === 0) {
      setFormError("Choose at least one tag for this announcement.");
      return;
    }

    setFormError("");

    updateAnnouncement(editingAnnouncementId, editDraft);
    setFormMessage("Announcement updated successfully.");

    resetForm();
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    Alert.alert("Delete announcement", `Delete \"${announcement.title}\"? This cannot be undone.`, [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAnnouncement(announcement.id);
          setFormMessage("Announcement deleted.");

          if (editingAnnouncementId === announcement.id) {
            resetForm();
          }
        }
      }
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>{pageSubtitle}</Text>
        </View>

        {canCreateAnnouncements ? (
          <View style={styles.createActionRow}>
            <Link href="/announcements/create" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Create announcement</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}

        {canAdminManageAnnouncements && editingAnnouncementId && editDraft ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Edit announcement</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={editDraft.title}
              onChangeText={(value) => setEditDraft((currentDraft) => (currentDraft ? { ...currentDraft, title: value } : currentDraft))}
              placeholder="Community town hall"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={editDraft.category}
              onChangeText={(value) =>
                setEditDraft((currentDraft) => (currentDraft ? { ...currentDraft, category: value } : currentDraft))
              }
              placeholder="Event"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Summary</Text>
            <TextInput
              style={styles.input}
              value={editDraft.summary}
              onChangeText={(value) =>
                setEditDraft((currentDraft) => (currentDraft ? { ...currentDraft, summary: value } : currentDraft))
              }
              placeholder="Short one-line summary"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Body</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDraft.body}
              onChangeText={(value) => setEditDraft((currentDraft) => (currentDraft ? { ...currentDraft, body: value } : currentDraft))}
              placeholder="Share the full event details"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TagSelector
              title="Announcement tags"
              helperText="Edit tags so members and organisers with matching preferences can discover this announcement."
              tags={state.tags}
              selectedTags={editDraft.tags}
              onToggleTag={toggleEditTag}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            {formMessage ? <Text style={styles.successText}>{formMessage}</Text> : null}

            <View style={styles.formActions}>
              <Pressable onPress={handleSubmitAnnouncementEdit} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save changes</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  resetForm();
                  setFormMessage("Edit cancelled.");
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel edit</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>All announcements</Text>
          {visibleAnnouncements.length > 0 ? (
            visibleAnnouncements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementItem}>
                <AnnouncementCard announcement={announcement} showSummary />

                {canAdminManageAnnouncements ? (
                  <View style={styles.adminActions}>
                    <Pressable onPress={() => startEditAnnouncement(announcement)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>

                    <Pressable onPress={() => handleDeleteAnnouncement(announcement)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No announcements are available right now.</Text>
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
  createActionRow: {
    alignItems: "flex-start"
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  },
  formTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: theme.spacing.xs
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: theme.spacing.xs
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
  textArea: {
    minHeight: 120
  },
  errorText: {
    color: "#9a2f12",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  successText: {
    color: "#2f6b2f",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  formActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
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
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  list: {
    gap: theme.spacing.lg
  },
  announcementItem: {
    gap: theme.spacing.sm
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm
  },
  editButton: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  editButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700"
  },
  deleteButton: {
    backgroundColor: "#9a2f12",
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  deleteButtonText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: "700"
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
