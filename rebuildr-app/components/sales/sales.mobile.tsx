import { AccountSalesQuery } from "@/gql/graphql";
import { Header } from "@components/navigation/headers/header";
import { SalesList } from "@components/sales/sales-list";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";

type Props = {
  myPurchases: AccountSalesQuery["myPurchases"];
};

export const SalesMobile = ({ myPurchases }: Props) => {
  return (
    <ScreenLayout headerComponent={<Header title="Dina försäljningar" />}>
      <Display size="small" style={{ marginBottom: 24 }}>
        Pågående & avslutade försäljningar
      </Display>
      <SalesList myPurchases={myPurchases} />
    </ScreenLayout>
  );
};
