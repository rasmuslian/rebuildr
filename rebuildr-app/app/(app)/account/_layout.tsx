import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="purchases" options={{ headerShown: false }} />
      <Stack.Screen name="sales" options={{ headerShown: false }} />
      <Stack.Screen
        name="internal-inventory"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="organization" options={{ headerShown: false }} />
    </Stack>
  );
}
