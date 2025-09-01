import { Stack } from "expo-router";

export default function ProjectsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[userId]" options={{ headerShown: false }} />
    </Stack>
  );
}
