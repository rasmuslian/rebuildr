import {
  ProductConditionEnum,
  ProductStatusEnum,
  QuantityUnitEnum,
  ShippingProviderEnum,
} from "@/gql/graphql";

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
  //initial
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
  minimumPrice?: number;

  //project
  noProject?: boolean;
  project?: {
    id: string;
  };

  //transportation
  pickupEnabled: boolean;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  approximatePlace?: {
    lat: number;
    lng: number;
    address: string;
  };

  shippingPrices: {
    id: string;
    maxWeight: number;
    price: number;
    provider: ShippingProviderEnum;
  }[];

  deliveryRadius?: number;
  deliveryPrice?: number;
  deliveryEnabled: boolean;

  status: ProductStatusEnum;
};
