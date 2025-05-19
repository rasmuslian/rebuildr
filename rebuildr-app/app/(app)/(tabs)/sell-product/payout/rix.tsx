import { PayoutMethodRix } from "@components/payout-methods/rix";
import { router } from "expo-router";

export default function Rix() {
  const onAccountCreated = () => {
    router.dismissTo("/(app)/sell-product");
  };

  return <PayoutMethodRix onCompleted={onAccountCreated} />;
}
