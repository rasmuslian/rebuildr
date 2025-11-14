import {
  AccountPurchasesQuery,
  AccountPurchasesQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PurchasesDesktop } from "@components/purchases/purchases.desktop";
import { PurchasesMobile } from "@components/purchases/purchases.mobile";
import { useScreenType } from "@hooks/useScreenType";

const ACCOUNT_PURCHASES = gql`
  query AccountPurchases($input: MyPurchasesInput!) {
    myPurchases(input: $input) {
      id
      status
      paymentAcceptedAt
      sellerRespondedAt
      transportationMethod
      deliveredAt
      approvedAt
      failedAt
      product {
        id
        title
        status
        primaryQuantity
        primaryUnit
        condition
        primaryImage {
          id
          url
        }
        price
        seller {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
      reportPurchase {
        id
        resolution
      }
    }
  }
`;

export default function Purchases() {
  const { isDesktop } = useScreenType();
  const { data } = useQuery<
    AccountPurchasesQuery,
    AccountPurchasesQueryVariables
  >(ACCOUNT_PURCHASES, { variables: { input: { myRole: "buyer" } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  if (isDesktop) {
    return <PurchasesDesktop myPurchases={data.myPurchases} />;
  }

  return <PurchasesMobile myPurchases={data.myPurchases} />;
}
