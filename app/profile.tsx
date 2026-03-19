import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TagSelector } from "@/components/TagSelector";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { announcementService } from "@/services/announcementService";
import { Announcement, Tag, TagId } from "@/types";

export default function ProfileScreen() {
  const { state, updateCurrentUserInterests, createTag, updateTag, deleteTag } = useAppContext();
  const user = state.currentUser;
  const isAdmin = user?.role === "admin";

  const [matchedAnnouncements, setMatchedAnnouncements] = useState<Announcement[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<TagId[]>(user?.interests ?? []);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [editingTagId, setEditingTagId] = useState<TagId | null>(null);
  const [editingTagLabel, setEditingTagLabel] = useState("");
  const [editingTagDescription, setEditingTagDescription] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const tagLabelMap = useMemo(() => new Map(state.tags.map((tag) => [tag.id, tag.label])), [state.tags]);

  const interests =
    user && user.interests.length > 0
      ? user.interests.map((tagId) => tagLabelMap.get(tagId) ?? tagId).join(", ")
      : "No interests set";

  const signedUpEvents =
    user && user.signedUpEventIds.length > 0
      ? state.announcements
          .filter((announcement) => user.signedUpEventIds.includes(announcement.id))
          .map((announcement) => announcement.title)
          .join(", ")
      : "No event signups yet";

  useEffect(() => {
    setSelectedInterests(user?.interests ?? []);
  }, [user?.interests]);

  useEffect(() => {
    let isMounted = true;

    announcementService.listAnnouncementsForUser(user, state.announcements).then((announcements) => {
      if (isMounted) {
        setMatchedAnnouncements(announcements);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [state.announcements, user]);

  const toggleInterestTag = (tagId: TagId) => {
    setSelectedInterests((currentTags) =>
      currentTags.includes(tagId) ? currentTags.filter((currentTag) => currentTag !== tagId) : [...currentTags, tagId]
    );
  };

  const saveUserInterests = () => {
    if (!user) {
      return;
    }

    updateCurrentUserInterests(selectedInterests);
    setErrorMessage("");
    setMessage("Tag preferences updated.");
  };

  const handleCreateTag = () => {
    if (!newTagLabel.trim()) {
      setErrorMessage("Tag label is required.");
      return;
    }

    createTag({
      label: newTagLabel,
      description: newTagDescription
    });

    setNewTagLabel("");
    setNewTagDescription("");
    setErrorMessage("");
    setMessage("Tag created.");
  };

  const beginTagEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagLabel(tag.label);
    setEditingTagDescription(tag.description);
    setErrorMessage("");
    setMessage("");
  };

  const saveTagEdit = () => {
    if (!editingTagId) {
      return;
    }

    if (!editingTagLabel.trim()) {
      setErrorMessage("Tag label is required.");
      return;
    }

    updateTag(editingTagId, {
      label: editingTagLabel,
      description: editingTagDescription
    });

    setEditingTagId(null);
    setEditingTagLabel("");
    setEditingTagDescription("");
    setErrorMessage("");
    setMessage("Tag updated.");
  };

  const removeTag = (tag: Tag) => {
    Alert.alert("Delete tag", `Delete \"${tag.label}\"? This removes it from all announcements and user interests.`, [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTag(tag.id);
          setMessage("Tag deleted.");

          if (editingTagId === tag.id) {
            setEditingTagId(null);
            setEditingTagLabel("");
            setEditingTagDescription("");
          }
        }
      }
    ]);
  };

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

          {user ? (
            <Pressable onPress={() => router.push("/settings" as never)} style={styles.settingsLink}>
              <Text style={styles.settingsLinkText}>Open account settings</Text>
            </Pressable>
          ) : null}

          {!isAdmin ? <Text style={styles.label}>Interests</Text> : null}
          {!isAdmin ? <Text style={styles.value}>{interests}</Text> : null}

          {!isAdmin ? <Text style={styles.label}>Signed Up Events</Text> : null}
          {!isAdmin ? <Text style={styles.value}>{signedUpEvents}</Text> : null}

          <Text style={styles.label}>{isAdmin ? "Visible announcements" : "Matching event notifications"}</Text>
          <Text style={styles.value}>
            {user
              ? matchedAnnouncements.length > 0
                ? matchedAnnouncements.map((announcement) => announcement.title).join("\n")
                : isAdmin
                ? "No announcements available yet"
                : "No matching announcements yet"
              : "Sign in to see matched notifications"}
          </Text>
        </View>

        {user && !isAdmin ? (
          <View style={styles.card}>
            <TagSelector
              title="My tag preferences"
              helperText="Select tags you care about. Your home page will only show announcements matching these tags."
              tags={state.tags}
              selectedTags={selectedInterests}
              onToggleTag={toggleInterestTag}
            />

            <Pressable onPress={saveUserInterests} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save tag preferences</Text>
            </Pressable>
          </View>
        ) : null}

        {isAdmin ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin tag management</Text>
            <Text style={styles.helperText}>Create, edit, and delete tags. Changes apply immediately to announcements and user interests.</Text>

            <Text style={styles.label}>New tag label</Text>
            <TextInput
              value={newTagLabel}
              onChangeText={setNewTagLabel}
              placeholder="Neighbourhood"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>New tag description</Text>
            <TextInput
              value={newTagDescription}
              onChangeText={setNewTagDescription}
              placeholder="Announcements relevant to neighbourhood updates."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <Pressable onPress={handleCreateTag} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create tag</Text>
            </Pressable>

            <View style={styles.tagList}>
              {state.tags.map((tag) => (
                <View key={tag.id} style={styles.tagRow}>
                  {editingTagId === tag.id ? (
                    <>
                      <TextInput
                        value={editingTagLabel}
                        onChangeText={setEditingTagLabel}
                        placeholder="Tag label"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.input}
                      />
                      <TextInput
                        value={editingTagDescription}
                        onChangeText={setEditingTagDescription}
                        placeholder="Tag description"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.input}
                      />
                      <View style={styles.tagActionRow}>
                        <Pressable onPress={saveTagEdit} style={styles.editButton}>
                          <Text style={styles.editButtonText}>Save</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setEditingTagId(null);
                            setEditingTagLabel("");
                            setEditingTagDescription("");
                            setErrorMessage("");
                          }}
                          style={styles.ghostButton}
                        >
                          <Text style={styles.ghostButtonText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.tagTitle}>{tag.label}</Text>
                      <Text style={styles.tagDescription}>{tag.description}</Text>
                      <View style={styles.tagActionRow}>
                        <Pressable onPress={() => beginTagEdit(tag)} style={styles.editButton}>
                          <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={() => removeTag(tag)} style={styles.deleteButton}>
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}
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
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  tagList: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md
  },
  tagRow: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  tagTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  tagDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20
  },
  tagActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs
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
  ghostButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  ghostButtonText: {
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
  errorText: {
    color: "#9a2f12",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  successText: {
    color: "#2f6b2f",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
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
