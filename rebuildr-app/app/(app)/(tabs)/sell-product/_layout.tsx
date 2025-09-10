import { isLoggedInVar } from "@/apollo/config";
import { HandleDraftProvider } from "@context/handle-draft-context";
import { Redirect, Slot } from "expo-router";

export default function SellProductLayout() {
  const isLoggedIn = isLoggedInVar();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }
  return (
    <HandleDraftProvider>
      <Slot />
    </HandleDraftProvider>
  );
}
