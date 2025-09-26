import { Stack } from "expo-router";

export default function ArticleLayout() {
  return (
    <Stack>
      <Stack.Screen name="[articleId]" options={{ headerShown: false }} />
    </Stack>
  );
}
