import { AccountPurchasesQuery } from "@/gql/graphql";

type Props = {
  myPurchases: AccountPurchasesQuery["myPurchases"];
}

export const PurchasesDesktop = ({ myPurchases }: Props) => {
  return <></>;
};
