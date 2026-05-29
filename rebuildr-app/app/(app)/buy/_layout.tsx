import { Slot } from "expo-router";
import { useRequireAuth } from "@components/require-auth/require-auth";

export default function BuyLayout() {
  const { redirect } = useRequireAuth();
  if (redirect) return redirect;
  return <Slot />;
}
