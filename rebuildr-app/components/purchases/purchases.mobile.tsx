import { AccountPurchasesQuery } from "@/gql/graphql";
import { Display } from "@components/typography/text";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { PurchasesList } from "./purchases-list";

type Props = {
  myPurchases: AccountPurchasesQuery["myPurchases"];
}

export const PurchasesMobile = ({ myPurchases }: Props) => {

  return (
    <ScreenLayout headerComponent={<Header title="Dina köp" />}>
      <Display size="small" style={{ marginBottom: 24 }}>
        Pågående & avslutade köp
      </Display>
      <PurchasesList myPurchases={myPurchases} />
    </ScreenLayout>
  );
};
