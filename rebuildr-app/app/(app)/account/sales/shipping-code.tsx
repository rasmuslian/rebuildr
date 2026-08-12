import { ShippingCodeQuery, ShippingCodeQueryVariables } from "@/gql/graphql";
import { shareUrl } from "@/utils/share-url";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { ShippingCodeContent } from "@components/shipping-code/shipping-code-content";
import { router, useLocalSearchParams } from "expo-router";

const SHIPPING_CODE = gql`
  query ShippingCode($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      qrCodeUrl
      qrCodeContent
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

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      loading={!data}
      headerComponent={
        <Header
          title="Visa QR-kod"
          ctas={[
            {
              icon: "upload",
              onPress: () => {
                if (data.purchase.qrCodeUrl) {
                  shareUrl(data.purchase.qrCodeUrl, {
                    dialogTitle: "Dela din QR-kod",
                    copiedMessage: "QR-kod kopierad!",
                  });
                }
              },
            },
          ]}
        />
      }
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
      <ShippingCodeContent purchase={data?.purchase} />
    </ScreenLayout>
  );
}
