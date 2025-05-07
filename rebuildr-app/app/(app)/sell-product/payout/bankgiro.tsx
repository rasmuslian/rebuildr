import { PayoutMethodBankgiro } from "@components/payout-methods/bankgiro";
import { router } from "expo-router";

export default function Bankgiro() {
  const onAccountCreated = () => {
    router.dismissTo("/(app)/sell-product");
  };

  return <PayoutMethodBankgiro onCompleted={onAccountCreated} />;
}
