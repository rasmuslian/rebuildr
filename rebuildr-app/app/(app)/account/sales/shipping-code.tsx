import { Button } from "@components/buttons/button";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { ShippingCodeContent } from "@components/shipping-code/shipping-code-content";
import { router, useLocalSearchParams } from "expo-router";

export default function ShippingCode() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
  return (
    <ScreenLayout
      headerComponent={<Header title="Visa QR-kod" />}
      footerComponent={
        <Button
          label="Gå tillbaka"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.navigate({
                  pathname: "/account/sales/[purchaseId]",
                  params: { purchaseId },
                })
          }
          style={{ marginTop: 24 }}
        />
      }
    >
      <ShippingCodeContent purchaseId={purchaseId} />
    </ScreenLayout>
  );
}
