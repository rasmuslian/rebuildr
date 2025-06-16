import { Stack } from "expo-router";

export default function FilterLyout() {
  return (
    <Stack>
      <Stack.Screen name="filter" options={{ headerShown: false }} />
    </Stack>
  );
}
