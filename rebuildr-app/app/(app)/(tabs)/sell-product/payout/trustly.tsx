import { PayoutMethodTrustly } from "@components/payout-methods/trustly";
import { router } from "expo-router";

export default function Trustly() {
  const onAccountCreated = () => {
    router.dismissTo("/(app)/sell-product");
    return null;
  };
  const onFailure = () => {
    console.log("Failure setting up Trustly");
    router.dismissTo("/(app)/sell-product/payout/payout-method");
    return null;
  };

  return (
    <PayoutMethodTrustly
      onCompleted={() => onAccountCreated()}
      onFailure={onFailure}
    />
  );
}
