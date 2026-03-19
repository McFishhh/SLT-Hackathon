// app/announcements/[id]/signup.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { submitSignup } from "@/services/signupService";

export default function SignupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useAppContext();
  const router = useRouter();
  console.log("SignupScreen mounted, id =", id);
  const [name, setName] = useState(state.currentUser?.displayName ?? "");
  const [email, setEmail] = useState(state.currentUser?.email ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing info", "Please fill in your name and email.");
      return;
    }

    setLoading(true);
    try {
      await submitSignup({
        eventId: id,
        name: name.trim(),
        email: email.trim(),
        userId: state.currentUser?.id ?? null,
      });
      console.log(name, email, state.currentUser?.id);
      router.push(`/announcements/${id}`);
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollEnabled>
      <View style={styles.container}>
        <Text style={styles.heading}>Sign Up for Event</Text>
        <Text style={styles.subheading}>
          Fill in your details below to reserve your spot.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Confirm Sign Up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push(`/announcements/${id}`)} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.lg },
  heading: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 16, lineHeight: 24 },
  field: { gap: theme.spacing.xs },
  label: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    padding: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: "800" },
  cancelButton: { alignItems: "center", paddingVertical: theme.spacing.sm },
  cancelText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: "600" },
});