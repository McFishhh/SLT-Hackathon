import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { checkIfSignedUp, submitSignup } from "@/services/signupService";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setCurrentUser, setLoading, state } = useAppContext();
  const router = useRouter();

  const tagLabelMap = useMemo(() => new Map(state.tags.map((tag) => [tag.id, tag.label])), [state.tags]);

  const [hasSignedUp, setHasSignedUp] = useState(Boolean(id && state.currentUser?.signedUpEventIds.includes(id)));
  const [checkingSignup, setCheckingSignup] = useState(true);
  const [hasCheckedSignup, setHasCheckedSignup] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        if (!id) {
          setHasSignedUp(false);
          setCheckingSignup(false);
          setHasCheckedSignup(true);
          return;
        }

        if (state.currentUser?.signedUpEventIds.includes(id)) {
          setHasSignedUp(true);
          setCheckingSignup(false);
          setHasCheckedSignup(true);
          return;
        }

        try {
          if (!hasCheckedSignup) {
            setCheckingSignup(true);
          }

          const result = await checkIfSignedUp(id, state.currentUser?.id ?? null);
          setHasSignedUp(result);
        } catch (error) {
          console.error("Unable to check signup status", error);
          setHasSignedUp(false);
        } finally {
          setCheckingSignup(false);
          setHasCheckedSignup(true);
        }
      };

      void check();
    }, [hasCheckedSignup, id, state.currentUser?.id, state.currentUser?.signedUpEventIds])
  );

  const handleSignup = async () => {
    if (!id) {
      return;
    }

    if (!state.currentUser) {
      router.push({
        pathname: "/login",
        params: {
          redirectTo: `/announcements/${id}`
        }
      });
      return;
    }

    try {
      setLoading(true);

      await submitSignup({
        eventId: id,
        name: state.currentUser.displayName,
        email: state.currentUser.email,
        userId: state.currentUser.id
      });

      setCurrentUser({
        ...state.currentUser,
        signedUpEventIds: state.currentUser.signedUpEventIds.includes(id)
          ? state.currentUser.signedUpEventIds
          : [...state.currentUser.signedUpEventIds, id]
      });

      setHasSignedUp(true);
      Alert.alert("Signed up", "Your event signup has been confirmed.");
    } catch (error) {
      console.error("Unable to sign up for event", error);
      Alert.alert("Signup failed", error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

        <Pressable
          style={[
            styles.signUpButton,
            (hasSignedUp || checkingSignup || state.isLoading) && styles.signUpButtonDisabled,
            hasSignedUp && styles.signUpButtonDone
          ]}
          onPress={handleSignup}
          disabled={hasSignedUp || checkingSignup || state.isLoading}
        >
          <Text style={styles.signUpButtonText}>
            {checkingSignup
              ? "Checking..."
              : hasSignedUp
              ? "Signed Up"
              : state.currentUser
              ? state.isLoading
                ? "Signing You Up..."
                : "Sign Up for this Event"
              : "Log In to Sign Up"}
          </Text>
        </Pressable>
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
  },
  signUpButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  signUpButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  signUpButtonDisabled: {
    opacity: 0.7
  },
  signUpButtonDone: {
    backgroundColor: theme.colors.brownDark
  }
});
