export const PayoutMethods = ["Swish", "Trustly"] as const;
export type PayoutMethodType = (typeof PayoutMethods)[number];
export const PayoutMethodsOrganization = [
  "Bankkonto",
  "Bankgiro",
  "Plusgiro",
] as const;
export type PayoutMethodOrganizationType =
  (typeof PayoutMethodsOrganization)[number];
