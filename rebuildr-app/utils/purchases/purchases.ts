import { AccountPurchasesQuery, AccountSalesQuery } from "@/gql/graphql";

type PurchasesType =
  | AccountSalesQuery["myPurchases"][number]
  | AccountPurchasesQuery["myPurchases"][number];

export const isFinished = (purchase: PurchasesType) => {
  return !!purchase.deliveredAt || !!purchase.failedAt;
};
