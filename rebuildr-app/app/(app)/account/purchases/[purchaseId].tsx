import {
  PurchasesPurchaseReceiptQuery,
  PurchasesPurchaseReceiptQueryVariables,
} from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { gql, useQuery } from "@apollo/client";
import { Header } from "@components/navigation/headers/header";
import { PurchaseReceipt } from "@components/purchase/purchase-receipt";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useLocalSearchParams } from "expo-router";

const PURCHASES_PURCHASE_RECEIPT = gql`
  query PurchasesPurchaseReceipt($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
      sellerRespondedAt
      transportationMethod
      product {
        id
        status
      }
    }
  }
`;

export default function PurchasesPurchase() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();

  const { data } = useQuery<
    PurchasesPurchaseReceiptQuery,
    PurchasesPurchaseReceiptQueryVariables
  >(PURCHASES_PURCHASE_RECEIPT, { variables: { input: { id: purchaseId } } });

  return (
    <ScreenLayout
      headerComponent={
        <Header
          title="Om köpet"
          showDivider={false}
          badge={
            data
              ? getProductBadgeProps(
                  data.purchase.product.status,
                  "buyer",
                  data.purchase,
                )
              : undefined
          }
        />
      }
    >
      <PurchaseReceipt purchaseId={purchaseId} />
    </ScreenLayout>
  );
}
