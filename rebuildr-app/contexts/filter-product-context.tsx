import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";

export enum FilterProductCameFromEnum {
  categories,
}

export const minimumPrice = 0;
export const maximumPrice = 10000;
//undefined means include all
//empty list means includ none
export type Filter = {
  sorting: OrderProductsEnum;
  rootCategoryIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  conditions?: ProductConditionEnum[];
  price: [number, number]; // lower, higher
  selectedCategoryId?: string;
  cameFrom?: FilterProductCameFromEnum;
  searchString?: string;
};

export const initialFilterProduct: Filter = {
  sorting: OrderProductsEnum.BestMatch,
  rootCategoryIds: undefined,
  categoryIds: undefined,
  brandIds: undefined,
  conditions: undefined,
  price: [minimumPrice, maximumPrice],
  selectedCategoryId: undefined,
  cameFrom: undefined,
  searchString: undefined,
};
