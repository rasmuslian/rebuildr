import {
  SalesPurchaseReceiptQuery,
  SalesPurchaseReceiptQueryVariables,
} from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { gql, useQuery } from "@apollo/client";
import { Header } from "@components/navigation/headers/header";
import { PurchaseReceipt } from "@components/purchase/purchase-receipt";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useLocalSearchParams } from "expo-router";

const SALES_PURCHASE_RECEIPT = gql`
  query SalesPurchaseReceipt($input: GetPurchaseInput!) {
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

export default function SalesPurchase() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();

  const { data } = useQuery<
    SalesPurchaseReceiptQuery,
    SalesPurchaseReceiptQueryVariables
  >(SALES_PURCHASE_RECEIPT, { variables: { input: { id: purchaseId } } });

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
                  "seller",
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
