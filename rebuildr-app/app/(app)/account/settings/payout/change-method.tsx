import { PayoutVerify } from "@components/payout/payout-verify";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router } from "expo-router";

export default function ChangeMethod() {
  return (
    <ScreenLayout>
      <PayoutVerify
        title="Ändra utbetalningskonto"
        body="För att ändra utbetalningskonto behöver du först verifiera dig med BankID. Därefter kan du välja Swish eller bankkonto via Trustly."
        showQRTitle="Verifiera dig med BankID"
        showQRBody="Du har valt att ändra utbetalningskonto. För att kunna välja ett nytt konto behöver du först verifiera dig med BankID."
        onVerifyComplete={() =>
          router.navigate("/(app)/account/settings/payout/payout-method")
        }
      />
    </ScreenLayout>
  );
}
