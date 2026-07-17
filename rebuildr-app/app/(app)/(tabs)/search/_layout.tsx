import { Slot, Stack } from "expo-router";
import { isWeb } from "@constants/layout";

export default function SearchLayout() {
  // Web scrolls the document — render a plain Slot (native-stack pins screens).
  if (isWeb) return <Slot />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="in-season" />
      <Stack.Screen name="products" />
    </Stack>
  );
}
