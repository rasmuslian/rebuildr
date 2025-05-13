import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";

export const minimumPrice = 0;
export const maximumPrice = 10000;
//undefined means include all
//empty list means includ none
export type Filter = {
  sorting: OrderProductsEnum;
  searchString: string;
  rootCategoryIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  conditions?: ProductConditionEnum[];
  price: [number, number]; // lower, higher
};

export const initialFilterProduct: Filter = {
  sorting: OrderProductsEnum.BestMatch,
  searchString: "",
  rootCategoryIds: undefined,
  categoryIds: undefined,
  brandIds: undefined,
  conditions: undefined,
  price: [minimumPrice, maximumPrice],
};
