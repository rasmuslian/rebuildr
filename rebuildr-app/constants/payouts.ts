import { PayoutAccountEnum } from "@/gql/graphql";

export const PayoutMethods = ["Swish", "Trustly"] as const;
export type PayoutMethodPersonalType = (typeof PayoutMethods)[number];
export const PayoutMethodsOrganization = [
  "Bankkonto",
  "Bankgiro",
  "Plusgiro",
] as const;
export type PayoutMethodOrganizationType =
  (typeof PayoutMethodsOrganization)[number];
export type PayoutMethodType =
  | PayoutMethodPersonalType
  | PayoutMethodOrganizationType;

export type PayoutAccountToMethodType = {
  [key in PayoutAccountEnum]: PayoutMethodType;
};
export const payoutAccountToMethod: PayoutAccountToMethodType = {
  [PayoutAccountEnum.Swish]: "Swish",
  [PayoutAccountEnum.Trustly]: "Trustly",
  [PayoutAccountEnum.Rix]: "Bankkonto",
  [PayoutAccountEnum.Bankgiro]: "Bankgiro",
  [PayoutAccountEnum.Plusgiro]: "Plusgiro",
};
