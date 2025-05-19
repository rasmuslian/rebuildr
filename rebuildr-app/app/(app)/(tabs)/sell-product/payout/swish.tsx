import { PayoutMethodSwish } from "@components/payout-methods/swish";
import { router } from "expo-router";

export default function Swish() {
  const onAccountCreated = () => {
    router.dismissTo("/(app)/sell-product");
  };

  return <PayoutMethodSwish onCompleted={() => onAccountCreated()} />;
}
