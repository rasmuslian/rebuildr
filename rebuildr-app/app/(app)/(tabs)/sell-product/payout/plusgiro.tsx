import { PayoutMethodPlusgiro } from "@components/payout/payout-methods/plusgiro";
import { router } from "expo-router";

export default function Plusgiro() {
  const onAccountCreated = () => {
    router.dismissTo("/sell-product");
  };

  return <PayoutMethodPlusgiro onCompleted={onAccountCreated} />;
}
