import { Slot, Stack } from "expo-router";
import { isWeb } from "@constants/layout";

export default function AccountLayout() {
  // Web scrolls the document — render a plain Slot (native-stack pins screens).
  if (isWeb) return <Slot />;
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
    </Stack>
  );
}
