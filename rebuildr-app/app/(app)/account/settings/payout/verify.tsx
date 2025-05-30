import { PayoutVerify } from "@components/payout/payout-verify";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router } from "expo-router";

export default function Verify() {
  return (
    <ScreenLayout>
      <PayoutVerify
        title="Koppla ett utbetalningskonto"
        body="Du har inget utbetalningskonto kopplat. För att få betalt, verifiera dig med BankID och välj sedan Swish eller bankkonto via Trustly.."
        showQRTitle="Verifiera dig med BankID"
        showQRBody="Du verkar inte ha kopplat något utbetalningskonto ännu. För att få betalt behöver du först verifiera dig med BankID."
        onVerifyComplete={() =>
          router.navigate("/sell-product/payout/payout-method")
        }
      />
    </ScreenLayout>
  );
}
