import { PayoutMethodSwish } from "@components/payout/payout-methods/swish";
import { router } from "expo-router";

export default function Swish() {
  const onAccountCreated = () => {
    router.dismissTo("/account/settings/payout");
  };

  return <PayoutMethodSwish onCompleted={() => onAccountCreated()} />;
}
