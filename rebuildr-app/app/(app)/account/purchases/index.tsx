import {
  AccountPurchasesQuery,
  AccountPurchasesQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PurchasesMobile } from "@components/purchases/purchases.mobile";

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
  const { data } = useQuery<
    AccountPurchasesQuery,
    AccountPurchasesQueryVariables
  >(ACCOUNT_PURCHASES, { variables: { input: { myRole: "buyer" } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  return <PurchasesMobile myPurchases={data.myPurchases} />;
}
