import { QuantityUnitEnum } from "@/gql/graphql";

export const quantities: {
  [key in QuantityUnitEnum]: { plural: string; singular: string };
} = {
  [QuantityUnitEnum.Amount]: {
    singular: "st",
    plural: "st",
  },
  [QuantityUnitEnum.Bags]: {
    singular: "säck",
    plural: "säckar",
  },
  [QuantityUnitEnum.Rolls]: {
    singular: "rulle",
    plural: "rullar",
  },
  [QuantityUnitEnum.M]: {
    singular: "m",
    plural: "m",
  },
  [QuantityUnitEnum.M2]: {
    singular: "m2",
    plural: "m2",
  },
  [QuantityUnitEnum.M3]: {
    singular: "m3",
    plural: "m3",
  },
  [QuantityUnitEnum.Liters]: {
    singular: "liter",
    plural: "liter",
  },
  [QuantityUnitEnum.Cans]: {
    singular: "burk",
    plural: "burkar",
  },
  [QuantityUnitEnum.Plates]: {
    singular: "platta",
    plural: "plattor",
  },
  [QuantityUnitEnum.Packages]: {
    singular: "fpk",
    plural: "fpk",
  },
  [QuantityUnitEnum.Boards]: {
    singular: "skiva",
    plural: "skivor",
  },
  [QuantityUnitEnum.Kg]: {
    singular: "kg",
    plural: "kg",
  },
};
