import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";

import { AppProvider } from "@/context/AppContext";
import { theme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { firebaseAuth } from "@/lib/firebase";
import { announcementService } from "@/services/announcementService";
import { authService } from "@/services/authService";
import { tagService } from "@/services/tagService";

function AppBootstrap() {
  const { setAnnouncements, setCurrentUser, setTags } = useAppContext();

  useEffect(() => {
    let unsubscribeTags: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (unsubscribeTags) {
          unsubscribeTags();
          unsubscribeTags = undefined;
        }

        try {
          const tags = await tagService.listTags();
          setTags(tags);
        } catch (error) {
          console.error("Failed to load public tags", error);
          setTags([]);
        }

        setCurrentUser(null);
        setAnnouncements([]);
        return;
      }

      try {
        const [userProfile] = await Promise.all([
          authService.getUserProfileById(firebaseUser.uid),
          announcementService.ensureAnnouncementsBootstrapped(),
          tagService.ensureTagsBootstrapped()
        ]);
        const [announcements, tags] = await Promise.all([
          announcementService.listAnnouncements(),
          tagService.listTags()
        ]);

        setTags(tags);
        setCurrentUser(userProfile);
        setAnnouncements(announcements);

        if (unsubscribeTags) {
          unsubscribeTags();
        }

        unsubscribeTags = tagService.subscribeToTags(
          (nextTags) => {
            setTags(nextTags);
          },
          (error) => {
            console.error("Failed to sync tags", error);
          }
        );
      } catch (error) {
        console.error("Failed to restore app session", error);
      }
    });

    return () => {
      unsubscribe();

      if (unsubscribeTags) {
        unsubscribeTags();
      }
    };
  }, [setAnnouncements, setCurrentUser, setTags]);

  return null;
}

export default function RootLayout() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppBootstrap />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background
            },
            headerBackVisible: false,
            headerShadowVisible: false,
            headerTintColor: theme.colors.textPrimary,
            contentStyle: {
              backgroundColor: theme.colors.background
            },
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                  <Text style={styles.backButtonText}>{"< Back"}</Text>
                </Pressable>
              ) : null,
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
                <Link href="/login" asChild>
                  <Pressable style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Login</Text>
                  </Pressable>
                </Link>
              )
            }}
          />

          <Stack.Screen name="announcements" options={{ title: "Back" }} />
          <Stack.Screen name="announcements/create" options={{ title: "Create Announcement" }} />
          <Stack.Screen name="announcements/[id]" options={{ title: "Back" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
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
  },
  backButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  }
});
