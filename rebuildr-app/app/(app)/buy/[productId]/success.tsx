import { PurchaseSuccessQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { PurchaseReceipt } from "@components/purchase/purchase-receipt";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const PURCHASE_SUCCESS = gql`
  query PurchaseSuccess($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      boughtForFree
    }
    me {
      id
      email
    }
  }
`;

export default function Success() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
  const { data } = useQuery<PurchaseSuccessQuery>(PURCHASE_SUCCESS, {
    variables: { input: { id: purchaseId } },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout headerComponent={<Header title="Om köpet" />}>
      <View style={{ gap: 24, marginBottom: 32 }}>
        <Display
          size="small"
          style={{ textAlign: "center", marginHorizontal: 35 }}
        >
          {data.purchase.boughtForFree
            ? "Du har köpt varan för 0 kr"
            : "Toppen, nu har du betalat!"}
        </Display>
        <Body size="medium" style={{ textAlign: "center" }}>
          {data.purchase.boughtForFree
            ? `Du får en bekräftelse skickad till ${data.me.email}`
            : `Du får en bekräftelse från Rocker till ${data?.me.email}`}
        </Body>
      </View>
      <PurchaseReceipt purchaseId={purchaseId} />
    </ScreenLayout>
  );
}
