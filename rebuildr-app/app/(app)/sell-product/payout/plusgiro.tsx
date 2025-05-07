import { PayoutMethodPlusgiro } from "@components/payout-methods/plusgiro";
import { router } from "expo-router";

export default function Plusgiro() {
  const onAccountCreated = () => {
    router.dismissTo("/(app)/sell-product");
  };

  return <PayoutMethodPlusgiro onCompleted={onAccountCreated} />;
}
