import { Header } from "@components/navigation/headers/header";
import { PurchaseReceipt } from "@components/purchase/purchase-receipt";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Success() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
  const email = "minmail@gmail.com";

  return (
    <ScreenLayout headerComponent={<Header title="Om köpet" />}>
      <View style={{ gap: 24, marginBottom: 32 }}>
        <Display size="small" style={{ textAlign: "center" }}>
          Toppen, nu har du betalat!
        </Display>
        <Body size="medium" style={{ textAlign: "center" }}>
          Du får en bekräftelse från Rocker till {email}
        </Body>
      </View>
      <PurchaseReceipt purchaseId={purchaseId} />
    </ScreenLayout>
  );
}
