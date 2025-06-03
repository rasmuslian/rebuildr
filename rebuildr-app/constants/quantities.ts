import { QuantityUnitEnum } from "@/gql/graphql";

export const quantities: { [key in QuantityUnitEnum]: { short: string } } = {
  [QuantityUnitEnum.Amount]: {
    short: "st",
  },
  [QuantityUnitEnum.Bags]: {
    short: "säckar",
  },
  [QuantityUnitEnum.Rolls]: {
    short: "rullar",
  },
  [QuantityUnitEnum.M]: {
    short: "m",
  },
  [QuantityUnitEnum.M2]: {
    short: "m2",
  },
  [QuantityUnitEnum.M3]: {
    short: "m3",
  },
  [QuantityUnitEnum.Liters]: {
    short: "liter",
  },
  [QuantityUnitEnum.Cans]: {
    short: "burkar",
  },
  [QuantityUnitEnum.Plates]: {
    short: "plattor",
  },
  [QuantityUnitEnum.Packages]: {
    short: "fpk",
  },
  [QuantityUnitEnum.Boards]: {
    short: "skivor",
  },
  [QuantityUnitEnum.Kg]: {
    short: "kg",
  },
};
