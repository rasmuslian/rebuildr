import { Slot, Stack } from "expo-router";
import { isWeb } from "@constants/layout";

export default function ProjectLayout() {
  // Web scrolls the document — render a plain Slot (native-stack pins screens).
  if (isWeb) return <Slot />;
  return (
    <Stack>
      <Stack.Screen name="[projectId]" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="edit/[projectId]" options={{ headerShown: false }} />
    </Stack>
  );
}
