import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { authService } from "@/services/authService";

export default function LoginScreen() {
  const { setCurrentUser, setLoading, state } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Enter your email and password to log in.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const user = await authService.loginUser({
        email,
        password
      });

      setCurrentUser(user);
      router.replace("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to log in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollEnabled>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Login</Text>
          <Text style={styles.title}>Welcome back to BigCommunity.</Text>
          <Text style={styles.subtitle}>Log in with your email and password to continue.</Text>
        </View>

        <View style={styles.card}>
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
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            disabled={state.isLoading}
            onPress={handleLogin}
            style={[styles.primaryButton, state.isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>{state.isLoading ? "Logging in..." : "Log in"}</Text>
          </Pressable>

          <View style={styles.linkRow}>
            <Text style={styles.linkLabel}>Need an account?</Text>
            <Link href="./register" style={styles.linkText}>
              Register here
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
