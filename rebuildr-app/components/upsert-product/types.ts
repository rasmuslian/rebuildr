import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  ProductConditionEnum,
  ProductStatusEnum,
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
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

export type PublishedProductData = {
  productId?: string;
  title?: string;
  imageUrl?: string;
  condition: ProductConditionEnum;
  primaryQuantity?: number;
  primaryUnit?: QuantityUnitEnum;
  price?: number;
  isGiveaway?: boolean;
  soldByQuantity?: boolean;
};

export type ProductFields = {
  //initial
  categoryIds?: string[];
  title?: string;
  description?: string;
  additionalInfo?: string;
  internalReferenceNumber?: string;
  price?: number;
  primaryQuantity?: number;
  primaryUnit?: QuantityUnitEnum;
  secondaryQuantity?: number;
  secondaryUnit?: QuantityUnitEnum;
  thickness?: number;
  thicknessUnit: MeasurementUnitEnum;
  height?: number;
  heightUnit: MeasurementUnitEnum;
  width?: number;
  widthUnit: MeasurementUnitEnum;
  length?: number;
  lengthUnit: MeasurementUnitEnum;
  diameter?: number;
  diameterUnit: MeasurementUnitEnum;
  weight?: number;
  weightUnit: MeasurementUnitEnum;
  isGiveaway?: boolean;
  soldByQuantity?: boolean;
  priceSuggestionMin?: number;
  priceSuggestionMax?: number;
  condition: ProductConditionEnum;
  brandId?: string | null;
  images?: FileType[];
  documents?: FileType[];
  minimumPrice?: number;
  color?: string;
  colorType: ColorTypeEnum;

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
  availability?: ProductAvailabilityEnum;
  estimatedAvailableAt?: string | null;
  availabilityPrecision?: ProductAvailabilityPrecisionEnum | null;
  availableUntil?: string | null;
};
