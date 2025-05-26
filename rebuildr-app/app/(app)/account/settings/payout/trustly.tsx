import { PayoutMethodTrustly } from "@components/payout/payout-methods/trustly";
import { router } from "expo-router";

export default function Trustly() {
  const onAccountCreated = () => {
    router.dismissTo("/account/settings/payout");
    return null;
  };
  const onFailure = () => {
    console.log("Failure setting up Trustly");
    router.dismissTo("/account/settings/payout/payout-method");
    return null;
  };

  return (
    <PayoutMethodTrustly
      onCompleted={() => onAccountCreated()}
      onFailure={onFailure}
    />
  );
}
