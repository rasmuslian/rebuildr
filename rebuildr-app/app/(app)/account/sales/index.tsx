import { AccountSalesQuery, AccountSalesQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { SalesDesktop } from "@components/sales/sales.desktop";
import { SalesMobile } from "@components/sales/sales.mobile";
import { useScreenType } from "@hooks/useScreenType";

const ACCOUNT_SALES = gql`
  query AccountSales($input: MyPurchasesInput!) {
    myPurchases(input: $input) {
      id
      status
      paymentAcceptedAt
      sellerRespondedAt
      transportationMethod
      deliveredAt
      failedAt
      buyer {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
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
      }
      reportPurchase {
        id
        resolution
      }
    }
  }
`;

export default function Sales() {
  const { isDesktop } = useScreenType();

  const { data } = useQuery<AccountSalesQuery, AccountSalesQueryVariables>(
    ACCOUNT_SALES,
    { variables: { input: { myRole: "seller" } } },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  if (isDesktop) {
    return <SalesDesktop myPurchases={data.myPurchases} />;
  }

  return <SalesMobile myPurchases={data.myPurchases} />;
}
