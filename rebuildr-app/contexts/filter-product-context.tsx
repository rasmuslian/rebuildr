import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";

//undefined means include all
//empty list means includ none
export type Filter = {
  sorting: OrderProductsEnum;
  rootCategoryIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  conditions?: ProductConditionEnum[];
  price?: [number, number]; // lower, higher
  giveaway: boolean;
  searchString?: string;
  projectId?: string;
};

export const initialFilterProduct: Filter = {
  sorting: OrderProductsEnum.BestMatch,
  rootCategoryIds: undefined,
  categoryIds: undefined,
  brandIds: undefined,
  conditions: undefined,
  price: undefined,
  giveaway: false,
  searchString: undefined,
  projectId: undefined,
};
