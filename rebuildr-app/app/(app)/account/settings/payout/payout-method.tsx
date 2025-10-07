import { SelectPayoutMethod } from "@components/payout/select-payout-method";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import {
  PayoutMethodType,
  PayoutMethodOrganizationType,
} from "@constants/payouts";
import { router, Href } from "expo-router";

export default function PayoutMethod() {
  const onSelectMethod = (
    chosenMethod: PayoutMethodType | PayoutMethodOrganizationType,
  ) => {
    const base = "account/settings/payout";
    switch (chosenMethod) {
      case "Swish":
        router.navigate(`${base}/swish` as Href);
        break;
      case "Trustly":
        router.navigate(`${base}/trustly` as Href);
        break;
      case "Bankkonto":
        router.navigate(`${base}/rix` as Href);
        break;
      case "Bankgiro":
        router.navigate(`${base}/bankgiro` as Href);
        break;
      case "Plusgiro":
        router.navigate(`${base}/plusgiro` as Href);
        break;
      default:
        return null;
    }
  };
  return (
    <ScreenLayout>
      <SelectPayoutMethod onSelectMethod={onSelectMethod} />
    </ScreenLayout>
  );
}
