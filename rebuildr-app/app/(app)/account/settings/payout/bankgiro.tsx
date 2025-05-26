import { PayoutMethodBankgiro } from "@components/payout/payout-methods/bankgiro";
import { router } from "expo-router";

export default function Bankgiro() {
  const onAccountCreated = () => {
    router.dismissTo("/account/settings/payout");
  };

  return <PayoutMethodBankgiro onCompleted={onAccountCreated} />;
}
