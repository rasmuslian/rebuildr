import { isLoggedInVar } from "@/apollo/config";
import { Redirect, Slot } from "expo-router";

export default function SellProductLayout() {
  const isLoggedIn = isLoggedInVar();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }
  return <Slot />;
}
