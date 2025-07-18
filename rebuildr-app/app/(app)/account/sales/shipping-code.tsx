import { ShippingCodeQuery, ShippingCodeQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display, Body, Headline } from "@components/typography/text";
import { primitives } from "@constants/colors";
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

        <View style={{ gap: 16 }}>
          <Headline size="small">Såhär gör du:</Headline>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Check
              checkColor="primaryDark"
              selected
              color={primitives.primary200}
            />
            <Body size="medium">
              Vis din QR-kod hos valfritt Postnord-ombud
            </Body>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Check
              selected
              color={primitives.primary200}
              checkColor="primaryDark"
            />
            <Body size="medium">Ombudet skriver ut fraktsedeln åt dig</Body>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Check
              checkColor="primaryDark"
              selected
              color={primitives.primary200}
            />
            <Body size="medium">Paketet skickas</Body>
          </View>
        </View>
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
