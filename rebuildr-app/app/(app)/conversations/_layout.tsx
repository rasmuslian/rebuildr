import { Stack } from "expo-router";

export default function ConversationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[productId]/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[productId]/[userId]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[productId]/[userId]/[purchaseId]/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
