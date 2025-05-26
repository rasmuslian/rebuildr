import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SelectPayoutMethod } from "@components/payout/select-payout-method";

export default function PayoutMethod() {
  return (
    <ScreenLayout>
      <SelectPayoutMethod methodsBaseRoute="sell-product/payout" />
    </ScreenLayout>
  );
}
