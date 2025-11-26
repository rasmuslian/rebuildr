import { Stack } from "expo-router";

export default function ProductListLayout() {
  return (
    <Stack>
      <Stack.Screen name="[userId]" options={{ headerShown: false }} />
    </Stack>
  );
}
