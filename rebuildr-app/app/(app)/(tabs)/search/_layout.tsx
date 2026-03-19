import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="in-season" />
      <Stack.Screen name="products" />
    </Stack>
  );
}
