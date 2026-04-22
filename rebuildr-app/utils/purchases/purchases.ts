type PurchaseType = {
  reportPurchase?: { resolution?: unknown } | null;
  approvedAt?: unknown;
  failedAt?: unknown;
};

export const isPurchaseDone = (purchase: PurchaseType) => {
  const resolvedReport = !!purchase.reportPurchase?.resolution;
  return resolvedReport || !!purchase.approvedAt || !!purchase.failedAt;
};
