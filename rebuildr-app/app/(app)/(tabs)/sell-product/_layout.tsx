import { isLoggedInVar } from "@/apollo/config";
import { Redirect, Stack } from "expo-router";

export default function SellProductLayout() {
  const isLoggedIn = isLoggedInVar();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
