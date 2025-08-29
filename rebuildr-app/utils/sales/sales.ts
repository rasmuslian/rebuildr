import { AccountSalesQuery } from "@/gql/graphql";

type PurchasesType = AccountSalesQuery["myPurchases"][number];

export const isFinished = (purchase: PurchasesType) => {
  const hasOngoingReport =
    purchase.reportPurchase && !purchase.reportPurchase.resolution;

  return (!!purchase.deliveredAt && !hasOngoingReport) || !!purchase.failedAt;
};
