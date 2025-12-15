import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";
import { PermanentSectionType } from "@constants/permanent-sections";

export enum FilterProductCameFromEnum {
  categories,
}

export const minimumPrice = 0;
export const maximumPrice = 10000;
//undefined means include all
//empty list means includ none
export type Filter = {
  //Basic filters
  sorting: OrderProductsEnum;
  rootCategoryIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  conditions?: ProductConditionEnum[];
  price: [number, number]; // lower, higher
  searchString?: string;
  //Preset filters
  selectedCategoryId?: string;
  sourceSection?: PermanentSectionType;
  //Navigation filters
  cameFrom?: FilterProductCameFromEnum;
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
