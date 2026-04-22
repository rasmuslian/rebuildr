import { Purchase, ReportPurchaseResolutionEnum } from "@/gql/graphql";

type PurchaseType = {
  reportPurchase?: { resolution?: ReportPurchaseResolutionEnum | null } | null;
  approvedAt?: Purchase["approvedAt"] | null;
  failedAt?: Purchase["failedAt"] | null;
};

export const isPurchaseDone = (purchase: PurchaseType) => {
  const resolvedReport = !!purchase.reportPurchase?.resolution;
  return resolvedReport || !!purchase.approvedAt || !!purchase.failedAt;
};
