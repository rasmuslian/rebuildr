import { PayoutMethodSwish } from "@components/payout/payout-methods/swish";
import { router } from "expo-router";

export default function Swish() {
  const onAccountCreated = () => {
    router.dismissTo("/sell-product");
  };

  return <PayoutMethodSwish onCompleted={() => onAccountCreated()} />;
}
