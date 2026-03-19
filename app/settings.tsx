import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { TagSelector } from "@/components/TagSelector";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { availableTags } from "@/data/tagOptions";
import { authService } from "@/services/authService";

export default function SettingsScreen() {
  const { state, setCurrentUser, setLoading } = useAppContext();
  const user = state.currentUser;
  const [selectedTags, setSelectedTags] = useState<string[]>(user?.interests ?? []);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setSelectedTags(user?.interests ?? []);
  }, [user?.id, user?.interests]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tagId) ? currentTags.filter((currentTag) => currentTag !== tagId) : [...currentTags, tagId]
    );
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedProfile = await authService.updateUserInterests(user.id, selectedTags);
      setCurrentUser(updatedProfile);
      setSuccessMessage("Settings saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save your settings right now.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Sign in to manage settings</Text>
          <Text style={styles.gateBody}>Log in first, then you can update your account tags from this page.</Text>
          <Pressable onPress={() => router.push("/login" as never)}>
            <Text style={styles.inlineLink}>Go to login</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const tagTitle = user.role === "organiser" ? "Organisation tags" : "Interested tags";
  const helperText =
    user.role === "organiser"
      ? "Select tags your organisation represents. These are prioritized when creating announcements."
      : "Select tags you want to receive announcements about.";

  return (
    <Screen scrollEnabled>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Settings</Text>
          <Text style={styles.title}>Manage your account preferences</Text>
          <Text style={styles.subtitle}>
            {user.role === "organiser"
              ? "Choose the tags your organisation actively represents."
              : "Choose the tags that match what you want to follow."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Account role</Text>
          <Text style={styles.value}>{user.role}</Text>

          <TagSelector
            title={tagTitle}
            helperText={helperText}
            tags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={state.isLoading}
            style={[styles.saveButton, state.isLoading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>{state.isLoading ? "Saving..." : "Save settings"}</Text>
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
    fontSize: 31,
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
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700"
  },
  errorText: {
    color: "#9a2f12",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  successText: {
    color: "#245f2f",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  saveButtonDisabled: {
    opacity: 0.72
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "800"
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
