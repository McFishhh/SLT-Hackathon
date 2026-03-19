import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/context/AppContext";
import { theme } from "@/constants/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background
            },
            headerShadowVisible: false,
            headerTintColor: theme.colors.textPrimary,
            contentStyle: {
              backgroundColor: theme.colors.background
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "700"
            }
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "BigCommunity",
              headerShown: false,
              headerRight: () => (
                <Link href="./login" asChild>
                  <Pressable style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Login</Text>
                  </Pressable>
                </Link>
              )
            }}
          />
          
          <Stack.Screen name="announcements" options={{ title: "Back" }} />
          <Stack.Screen name="announcements/[id]" options={{ title: "Back" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="auth" options={{ title: "Authentication" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  headerButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "800"
  }
});
