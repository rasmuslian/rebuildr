import { PayoutMethodRix } from "@components/payout/payout-methods/rix";
import { router } from "expo-router";

export default function Rix() {
  const onAccountCreated = () => {
    router.dismissTo("/sell-product");
  };

  return <PayoutMethodRix onCompleted={onAccountCreated} />;
}
