import { useScreenType } from "@hooks/useScreenType";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index", // TODO: Make sure this behaves as expected after index is changed for desktop.
};

export default function AccountLayout() {
  const { isDesktop } = useScreenType();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          presentation: isDesktop ? "transparentModal" : undefined,
        }}
      />
      <Stack.Screen name="purchases" options={{ headerShown: false }} />
      <Stack.Screen name="sales" options={{ headerShown: false }} />
    </Stack>
  );
}
