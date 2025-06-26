import { ProductConditionEnum, QuantityUnitEnum } from "@/gql/graphql";

export type FileType = {
  id?: string;
  index: number;
  uri: string;
  mimeType: string;
  file: File;
  size: number;
  name?: string | null;
};

export type ProductFields = {
  categoryIds?: string[];
  title?: string;
  description?: string;
  price?: number;
  primaryQuantity?: number;
  primaryUnit?: QuantityUnitEnum;
  secondaryQuantity?: number;
  secondaryUnit?: QuantityUnitEnum;
  thickness?: number;
  height?: number;
  width?: number;
  length?: number;
  diameter?: number;
  weight?: number;
  isGiveaway?: boolean;
  condition: ProductConditionEnum;
  brandId?: string | null;
  images?: FileType[];
  documents?: FileType[];
};
