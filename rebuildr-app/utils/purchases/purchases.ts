import { AccountPurchasesQuery } from "@/gql/graphql";

type PurchasesType = AccountPurchasesQuery["myPurchases"][number];

export const isPurchaseDone = (purchase: PurchasesType) => {
  const resolvedReport = !!purchase.reportPurchase?.resolution;
  return resolvedReport || !!purchase.approvedAt || !!purchase.failedAt;
};
