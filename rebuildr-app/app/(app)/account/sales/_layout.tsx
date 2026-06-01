import { Slot } from "expo-router";
import { useRequireAuth } from "@components/require-auth/require-auth";

export default function SalesLayout() {
  const { redirect } = useRequireAuth();
  if (redirect) return redirect;
  return <Slot />;
}
