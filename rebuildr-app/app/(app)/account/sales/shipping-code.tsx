import { ShippingCodeQuery, ShippingCodeQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { router, useLocalSearchParams } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import WebView from "react-native-webview";

const SHIPPING_CODE = gql`
  query ShippingCode($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      qrCodeUrl
    }
  }
`;

export default function ShippingCode() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
  const { data } = useQuery<ShippingCodeQuery, ShippingCodeQueryVariables>(
    SHIPPING_CODE,
    {
      variables: { input: { id: purchaseId } },
    },
  );
  const { width } = useWindowDimensions();

  const qrCodeUrl = data?.purchase.qrCodeUrl;

  return (
    <ScreenLayout headerComponent={<Header title="Visa QR-kod" />}>
      <View style={{ gap: 24 }}>
        {data && qrCodeUrl ? (
          <View style={{ flex: 1, padding: 16 }}>
            <WebView
              source={{ uri: qrCodeUrl }}
              style={{ width: width - 32 }}
              // onLoadStart={() => setLoadingQr(true)}
              // onLoadEnd={() => setLoadingQr(false)}
            />
          </View>
        ) : (
          <LoadingSpinner />
        )}
        <Display size="small" style={{ textAlign: "center" }}>
          Visa QR-koden och skicka paketet
        </Display>

        <Divider />

        <InstructionSteps
          steps={[
            "Visa din QR-kod hos valfritt Postnord-ombud",
            "Ombudet skriver ut fraktsedeln åt dig",
            "Paketet skickas",
          ]}
        />
      </View>

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
        style={{ marginTop: 82 }}
      />
    </ScreenLayout>
  );
}
