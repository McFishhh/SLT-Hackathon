import { Stack } from "expo-router";
import { theme } from "@/constants/theme";

export default function AnnouncementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerShown: false,
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700"
        }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};
