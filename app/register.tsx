import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AuthRoleSelector } from "@/components/AuthRoleSelector";
import { TagSelector } from "@/components/TagSelector";
import { Screen } from "@/components/Screen";
import { roleDescriptions } from "@/data/tagOptions";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { announcementService } from "@/services/announcementService";
import { authService } from "@/services/authService";
import { TagId, UserRole } from "@/types";

export default function RegisterScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const { setAnnouncements, setCurrentUser, setLoading, state } = useAppContext();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [selectedTags, setSelectedTags] = useState<TagId[]>(["events", "updates"]);
  const [errorMessage, setErrorMessage] = useState("");
  const shouldSelectTagsDuringRegistration = role === "member";

  const toggleTag = (tagId: TagId) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tagId) ? currentTags.filter((currentTag) => currentTag !== tagId) : [...currentTags, tagId]
    );
  };

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Name, email, and password are all required.");
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const user = await authService.registerUser({
        displayName: displayName.trim(),
        email,
        password,
        role,
        interests: shouldSelectTagsDuringRegistration ? selectedTags : []
      });
      await announcementService.ensureAnnouncementsBootstrapped();
      const announcements = await announcementService.listAnnouncements();

      setAnnouncements(announcements);
      setCurrentUser(user);
      router.replace((redirectTo || "/") as never);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create the account right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollEnabled>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Registration</Text>
          <Text style={styles.title}>Create an account that fits your role.</Text>
          <Text style={styles.subtitle}>
            Admins create tags, organisers assign tags to announcements, and members subscribe to the tags they care about.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            onChangeText={setDisplayName}
            placeholder="Jamie Koh"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={displayName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="jamie@example.com"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <AuthRoleSelector selectedRole={role} onSelectRole={setRole} />

          <View style={styles.rolePanel}>
            <Text style={styles.rolePanelTitle}>{roleDescriptions[role].title}</Text>
            <Text style={styles.rolePanelBody}>{roleDescriptions[role].description}</Text>
          </View>

          {shouldSelectTagsDuringRegistration ? (
            <TagSelector
              helperText="Choose the tags this member wants to receive updates about."
              selectedTags={selectedTags}
              tags={state.tags}
              title="Interested tags"
              onToggleTag={toggleTag}
            />
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            disabled={state.isLoading}
            onPress={handleRegister}
            style={[styles.primaryButton, state.isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>{state.isLoading ? "Creating account..." : "Create account"}</Text>
          </Pressable>

          <View style={styles.linkRow}>
            <Text style={styles.linkLabel}>Already have an account?</Text>
            <Link
              href={{
                pathname: "/login",
                params: redirectTo ? { redirectTo } : undefined
              }}
              style={styles.linkText}
            >
              Log in
            </Link>
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
    maxWidth: 720,
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
  rolePanel: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md
  },
  rolePanelTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700"
  },
  rolePanelBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
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
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    justifyContent: "center",
    marginTop: theme.spacing.md
  },
  linkLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "700"
  }
});
