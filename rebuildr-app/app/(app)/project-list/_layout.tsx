import { Slot, Stack } from "expo-router";
import { isWeb } from "@constants/layout";

export default function ProjectsLayout() {
  // Web scrolls the document — render a plain Slot (native-stack pins screens).
  if (isWeb) return <Slot />;
  return (
    <Stack>
      <Stack.Screen name="[userId]" options={{ headerShown: false }} />
    </Stack>
  );
}
