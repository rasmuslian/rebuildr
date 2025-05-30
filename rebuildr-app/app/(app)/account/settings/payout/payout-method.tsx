import { SelectPayoutMethod } from "@components/payout/select-payout-method";
import { ScreenLayout } from "@components/screen-layout/screen-layout";

export default function PayoutMethod() {
  return (
    <ScreenLayout>
      <SelectPayoutMethod methodsBaseRoute="account/settings/payout" />
    </ScreenLayout>
  );
}
