import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";
import { PermanentSectionType } from "@constants/permanent-sections";

export enum FilterProductCameFromEnum {
  categories,
}

//undefined means include all
//empty list means includ none
export type Filter = {
  //Basic filters
  sorting: OrderProductsEnum;
  rootCategoryIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  conditions?: ProductConditionEnum[];
  price?: [number, number]; // lower, higher
  giveaway: boolean;
  searchString?: string;
  projectId?: string;
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
  price: undefined,
  giveaway: false,
  selectedCategoryId: undefined,
  cameFrom: undefined,
  searchString: undefined,
  projectId: undefined,
};
