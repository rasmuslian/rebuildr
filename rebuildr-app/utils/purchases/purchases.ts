import { AccountPurchasesQuery } from "@/gql/graphql";

type PurchasesType = AccountPurchasesQuery["myPurchases"][number];

export const isFinished = (purchase: PurchasesType) => {
  const resolvedReport = !!purchase.reportPurchase?.resolution;
  return resolvedReport || !!purchase.approvedAt || !!purchase.failedAt;
};
