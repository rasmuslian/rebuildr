/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type Review = {
  __typename?: 'Review';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  stars: Scalars['Int']['output'];
  review: Scalars['String']['output'];
  reviewerId: Scalars['String']['output'];
  revieweeId: Scalars['String']['output'];
  reviewer: User;
  reviewee: User;
  purchase: Purchase;
};

export type ShippingPrice = {
  __typename?: 'ShippingPrice';
  id: Scalars['ID']['output'];
  maxWeight: Scalars['Float']['output'];
  provider: ShippingProviderEnum;
  price: Scalars['Float']['output'];
};

export enum ShippingProviderEnum {
  Postnord = 'POSTNORD',
  Dhl = 'DHL'
}

export type ReportPurchase = {
  __typename?: 'ReportPurchase';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  type: ReportPurchaseTypeEnum;
  message: Scalars['String']['output'];
  resolution?: Maybe<ReportPurchaseResolutionEnum>;
};

export enum ReportPurchaseTypeEnum {
  NotAsDescribed = 'NOT_AS_DESCRIBED',
  Damaged = 'DAMAGED',
  WrongProduct = 'WRONG_PRODUCT',
  ProductMissing = 'PRODUCT_MISSING',
  Other = 'OTHER'
}

export enum ReportPurchaseResolutionEnum {
  Refund = 'REFUND',
  Proceed = 'PROCEED',
  Other = 'OTHER'
}

export type Purchase = {
  __typename?: 'Purchase';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  buyerId: Scalars['String']['output'];
  paymentStartedAt?: Maybe<Scalars['DateTime']['output']>;
  paymentAcceptedAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentBookedAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentDroppedOffAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentDeliveredAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentStartedAt?: Maybe<Scalars['DateTime']['output']>;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutStartedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  pausedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutFailedAt?: Maybe<Scalars['DateTime']['output']>;
  status: PurchaseStatusEnum;
  abortedById?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  transportationMethod: TransportationEnum;
  toServicePointId?: Maybe<Scalars['String']['output']>;
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  qrCodeContent?: Maybe<Scalars['String']['output']>;
  sellerRespondedAt?: Maybe<Scalars['DateTime']['output']>;
  isShipping: Scalars['Boolean']['output'];
  reviews: Array<Review>;
  buyer: User;
  shippingPrice?: Maybe<ShippingPrice>;
  product: Product;
  isFree: Scalars['Boolean']['output'];
  isRefunded: Scalars['Boolean']['output'];
  boughtForFree: Scalars['Boolean']['output'];
  reportPurchase?: Maybe<ReportPurchase>;
};

export enum PurchaseStatusEnum {
  Claimed = 'CLAIMED',
  PaymentStarted = 'PAYMENT_STARTED',
  PaymentAccepted = 'PAYMENT_ACCEPTED',
  ShipmentBooked = 'SHIPMENT_BOOKED',
  ShipmentDroppedOff = 'SHIPMENT_DROPPED_OFF',
  ShippingStarted = 'SHIPPING_STARTED',
  ShippingDelivered = 'SHIPPING_DELIVERED',
  Delivered = 'DELIVERED',
  Approved = 'APPROVED',
  PayoutStarted = 'PAYOUT_STARTED',
  FinishedFailed = 'FINISHED_FAILED',
  FinishedSuccess = 'FINISHED_SUCCESS',
  Paused = 'PAUSED',
  PayoutFailed = 'PAYOUT_FAILED'
}

export enum PaymentMethod {
  Swish = 'SWISH',
  Card = 'CARD'
}

export enum TransportationEnum {
  Pickup = 'PICKUP',
  Shipping = 'SHIPPING',
  Delivery = 'DELIVERY'
}

export type MapPin = {
  __typename?: 'MapPin';
  id: Scalars['ID']['output'];
  product?: Maybe<Product>;
  location: LocationResponse;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  shortText?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  address: Scalars['String']['output'];
  showDetailsOnMap: Scalars['Boolean']['output'];
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  location: LocationResponse;
  approximatePlace: ApproximatePlaceResponse;
  products: Array<Product>;
  projectPicture?: Maybe<File>;
  user: User;
};


export type ProjectProductsArgs = {
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  id: Scalars['ID']['output'];
  searchString: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type ReportProduct = {
  __typename?: 'ReportProduct';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  type: ReportProductTypeEnum;
  message: Scalars['String']['output'];
  reporterId: Scalars['String']['output'];
};

export enum ReportProductTypeEnum {
  IncorrectInformation = 'INCORRECT_INFORMATION',
  MisleadingAdvertisement = 'MISLEADING_ADVERTISEMENT',
  DuplicateOrSpam = 'DUPLICATE_OR_SPAM',
  IrrelevantProduct = 'IRRELEVANT_PRODUCT',
  UnreasonablePrice = 'UNREASONABLE_PRICE',
  Other = 'OTHER'
}

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  username?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  postCode?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: UserRoleEnum;
  type: UserType;
  organizationNumber?: Maybe<Scalars['String']['output']>;
  organizationApprovedAt?: Maybe<Scalars['DateTime']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
  isFeatured: Scalars['Boolean']['output'];
  notifyOnMessage: Scalars['Boolean']['output'];
  notifyOnPurchaseUpdate: Scalars['Boolean']['output'];
  sellerAccountIsCreated: Scalars['Boolean']['output'];
  sellerAccountIsEnabled: Scalars['Boolean']['output'];
  profilePicture?: Maybe<File>;
  registrationStatus: RegisterStatusEnum;
  projects: Array<Project>;
  numberOfSoldProducts: Scalars['Int']['output'];
  numberOfPublishedProducts: Scalars['Int']['output'];
  products: Array<Product>;
  purchases: Array<Purchase>;
  sales: Array<Purchase>;
  rating?: Maybe<Scalars['Float']['output']>;
  likedProducts?: Maybe<ProductsResponse>;
  likedProjects?: Maybe<Array<Project>>;
  location?: Maybe<LocationResponse>;
  reviewed: Array<Review>;
  payoutAccount?: Maybe<PayoutAccount>;
  recommendedProducts: Array<Product>;
  organizationAccount?: Maybe<User>;
  organizationOwner?: Maybe<User>;
  totalCO2Savings: Scalars['Float']['output'];
};


export type UserLikedProductsArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type UserRecommendedProductsArgs = {
  input: RecommendedProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export enum UserRoleEnum {
  User = 'USER',
  Admin = 'ADMIN'
}

export enum UserType {
  Personal = 'PERSONAL',
  Business = 'BUSINESS'
}

export enum RegisterStatusEnum {
  Email = 'EMAIL',
  Details = 'DETAILS',
  Done = 'DONE'
}

export type RecommendedProductsInput = {
  recommendationSource: ProductsRecommendationSourceEnum;
  excludeOwnProducts?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ProductsRecommendationSourceEnum {
  Likes = 'LIKES',
  SearchHistory = 'SEARCH_HISTORY'
}

export type Message = {
  __typename?: 'Message';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  message: Scalars['String']['output'];
  senderId: Scalars['ID']['output'];
  receiverId: Scalars['ID']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  messageType: MessageTypeEnum;
  imagePutUrls?: Maybe<Array<Scalars['String']['output']>>;
  documentPutUrls?: Maybe<Array<Scalars['String']['output']>>;
  product: Product;
  sender: User;
  receiver: User;
  images: Array<File>;
  documents: Array<File>;
};

export enum MessageTypeEnum {
  User = 'USER',
  System = 'SYSTEM'
}

export type File = {
  __typename?: 'File';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  mimeType: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Brand = {
  __typename?: 'Brand';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  type: BrandTypeEnum;
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  canDelete: Scalars['Boolean']['output'];
  createdBy?: Maybe<User>;
};

export enum BrandTypeEnum {
  Other = 'OTHER',
  Regular = 'REGULAR'
}

export type Co2Factor = {
  __typename?: 'CO2Factor';
  id: Scalars['ID']['output'];
  coefficient: Scalars['Float']['output'];
  productName: Scalars['String']['output'];
  categoryName: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  description: Scalars['String']['output'];
  orderIndex: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  inSelection: Scalars['Boolean']['output'];
  inSeason: Scalars['Boolean']['output'];
  icon?: Maybe<CategoryIconEnum>;
  primaryQuantityUnit?: Maybe<QuantityUnitEnum>;
  secondaryQuantityUnit?: Maybe<QuantityUnitEnum>;
  measurements: Array<MeasurementTypeEnum>;
  children: Array<Category>;
  image?: Maybe<File>;
  ancestorIds: Array<Scalars['String']['output']>;
  hasChildren: Scalars['Boolean']['output'];
  brands: Array<Brand>;
  parent?: Maybe<Category>;
  co2Factor?: Maybe<Co2Factor>;
};

export enum CategoryIconEnum {
  Material = 'MATERIAL',
  Wood = 'WOOD',
  Door = 'DOOR',
  Window = 'WINDOW',
  Floor = 'FLOOR',
  Interior = 'INTERIOR',
  Paint = 'PAINT',
  Fasteners = 'FASTENERS',
  Roof = 'ROOF',
  Tiles = 'TILES',
  KitchenBathroom = 'KITCHEN_BATHROOM',
  Electrical = 'ELECTRICAL',
  Outdoors = 'OUTDOORS',
  Tools = 'TOOLS',
  Workplace = 'WORKPLACE'
}

export enum QuantityUnitEnum {
  Amount = 'AMOUNT',
  Bags = 'BAGS',
  Rolls = 'ROLLS',
  M = 'M',
  M2 = 'M2',
  M3 = 'M3',
  Liters = 'LITERS',
  Cans = 'CANS',
  Plates = 'PLATES',
  Packages = 'PACKAGES',
  Boards = 'BOARDS',
  Kg = 'KG'
}

export enum MeasurementTypeEnum {
  Thickness = 'THICKNESS',
  Height = 'HEIGHT',
  Width = 'WIDTH',
  Length = 'LENGTH',
  Diameter = 'DIAMETER',
  Weight = 'WEIGHT'
}

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  additionalInfo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  sellerId: Scalars['String']['output'];
  address?: Maybe<Scalars['String']['output']>;
  hiddenReason?: Maybe<Scalars['String']['output']>;
  isGiveaway: Scalars['Boolean']['output'];
  primaryQuantity?: Maybe<Scalars['Float']['output']>;
  primaryUnit?: Maybe<QuantityUnitEnum>;
  secondaryQuantity?: Maybe<Scalars['Float']['output']>;
  secondaryUnit?: Maybe<QuantityUnitEnum>;
  height?: Maybe<Scalars['Float']['output']>;
  heightUnit: MeasurementUnitEnum;
  width?: Maybe<Scalars['Float']['output']>;
  widthUnit: MeasurementUnitEnum;
  length?: Maybe<Scalars['Float']['output']>;
  lengthUnit: MeasurementUnitEnum;
  thickness?: Maybe<Scalars['Float']['output']>;
  thicknessUnit: MeasurementUnitEnum;
  diameter?: Maybe<Scalars['Float']['output']>;
  diameterUnit: MeasurementUnitEnum;
  weight?: Maybe<Scalars['Float']['output']>;
  weightUnit: MeasurementUnitEnum;
  color?: Maybe<Scalars['String']['output']>;
  colorType: ColorTypeEnum;
  condition: ProductConditionEnum;
  status: ProductStatusEnum;
  distanceFromPosition?: Maybe<Scalars['Float']['output']>;
  pickupEnabled: Scalars['Boolean']['output'];
  deliveryEnabled: Scalars['Boolean']['output'];
  deliveryRadius?: Maybe<Scalars['Float']['output']>;
  noProject?: Maybe<Scalars['Boolean']['output']>;
  co2Saving?: Maybe<Scalars['Float']['output']>;
  category?: Maybe<Category>;
  seller: User;
  primaryImage?: Maybe<File>;
  images: Array<File>;
  documents: Array<File>;
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  price: Scalars['Float']['output'];
  brand?: Maybe<Brand>;
  project?: Maybe<Project>;
  location?: Maybe<LocationResponse>;
  approximatePlace?: Maybe<ApproximatePlaceResponse>;
  shippingPrices?: Maybe<Array<ShippingPrice>>;
  deliveryPrice?: Maybe<Scalars['Float']['output']>;
  canDelete: Scalars['Boolean']['output'];
  minimumPrice: Scalars['Int']['output'];
  hasOngoingPurchase: Scalars['Boolean']['output'];
  reportProducts: Array<ReportProduct>;
  similarProducts: PaginatedProductsResponse;
  distanceFromLocation?: Maybe<Scalars['Float']['output']>;
};


export type ProductHasOngoingPurchaseArgs = {
  includeOwnPurchases?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ProductSimilarProductsArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProductDistanceFromLocationArgs = {
  location?: InputMaybe<LocationInputType>;
};

export enum MeasurementUnitEnum {
  M = 'M',
  Dm = 'DM',
  Cm = 'CM',
  Mm = 'MM',
  Kg = 'KG'
}

export enum ColorTypeEnum {
  Ncs = 'NCS',
  FreeText = 'FREE_TEXT'
}

export enum ProductConditionEnum {
  New = 'NEW',
  VeryGood = 'VERY_GOOD',
  Good = 'GOOD',
  Okay = 'OKAY',
  Bad = 'BAD'
}

export enum ProductStatusEnum {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Sold = 'SOLD',
  Deleted = 'DELETED'
}

export type LocationInputType = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type Partner = {
  __typename?: 'Partner';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  description: Scalars['String']['output'];
  websiteUrl?: Maybe<Scalars['String']['output']>;
  logo: File;
};

export type ResendVerificationMailResponse = {
  __typename?: 'ResendVerificationMailResponse';
  message: Scalars['String']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  user: User;
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type GetNewTokensResponse = {
  __typename?: 'GetNewTokensResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type ResetPasswordResponse = {
  __typename?: 'ResetPasswordResponse';
  message: Scalars['String']['output'];
};

export type GetAddressResponse = {
  __typename?: 'GetAddressResponse';
  address: Scalars['String']['output'];
};

export type LocationSearchResponse = {
  __typename?: 'LocationSearchResponse';
  result: Array<Scalars['String']['output']>;
};

export type LocationResponse = {
  __typename?: 'LocationResponse';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type ApproximatePlaceResponse = {
  __typename?: 'ApproximatePlaceResponse';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  address: Scalars['String']['output'];
};

export type ExactPlaceResponse = {
  __typename?: 'ExactPlaceResponse';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  address: Scalars['String']['output'];
};

export type ExactAndApproximatePlaceResponse = {
  __typename?: 'ExactAndApproximatePlaceResponse';
  exact: ExactPlaceResponse;
  approximate: ApproximatePlaceResponse;
};

export type CmsListFilesResponse = {
  __typename?: 'CmsListFilesResponse';
  files: Array<File>;
  total: Scalars['Int']['output'];
};

export type CmsCreateFilesResponse = {
  __typename?: 'CmsCreateFilesResponse';
  presignedPutUrls: Array<Scalars['String']['output']>;
};

export type ServicePointResponse = {
  __typename?: 'ServicePointResponse';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  distance: Scalars['Float']['output'];
  streetName: Scalars['String']['output'];
  streetNumber: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  city: Scalars['String']['output'];
};

export type CreateProductResponse = {
  __typename?: 'CreateProductResponse';
  product: Product;
  presignedPutUrls: Array<Scalars['String']['output']>;
};

export type UpdateProductResponse = {
  __typename?: 'UpdateProductResponse';
  product: Product;
  imagePutUrls: Array<Scalars['String']['output']>;
  documentPutUrls: Array<Scalars['String']['output']>;
};

export type PaginatedProductsResponse = {
  __typename?: 'PaginatedProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export type ProductsResponse = {
  __typename?: 'ProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
  /** If address or location is supplied to Products(), this will have corresponding coordinates */
  origin?: Maybe<LocationResponse>;
};

export type ShippingOptionResponse = {
  __typename?: 'ShippingOptionResponse';
  shippingPrice: ShippingPrice;
  servicePoints: Array<ServicePointResponse>;
};

export type DeliveryOptionResponse = {
  __typename?: 'DeliveryOptionResponse';
  deliverToLocation: LocationResponse;
  isWithinRadius: Scalars['Boolean']['output'];
  distanceFromProduct: Scalars['Float']['output'];
  deliveryPrice: Scalars['Float']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
};

export type CmsListProductsResponse = {
  __typename?: 'CmsListProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export type CmsCreateProductResponse = {
  __typename?: 'CmsCreateProductResponse';
  product: Product;
  imagePutUrls: Array<Scalars['String']['output']>;
  documentPutUrls: Array<Scalars['String']['output']>;
};

export type CmsUpdateProductResponse = {
  __typename?: 'CmsUpdateProductResponse';
  product: Product;
  imagePutUrls: Array<Scalars['String']['output']>;
  documentPutUrls: Array<Scalars['String']['output']>;
};

export type ProductPriceRangeResponse = {
  __typename?: 'ProductPriceRangeResponse';
  min: Scalars['Int']['output'];
  max: Scalars['Int']['output'];
};

export type UpdateUserResponse = {
  __typename?: 'UpdateUserResponse';
  user: User;
  profilePicturePutUrl?: Maybe<Scalars['String']['output']>;
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  users: Array<User>;
  total: Scalars['Int']['output'];
};

export type PayoutAccount = {
  __typename?: 'PayoutAccount';
  type: Scalars['String']['output'];
  routingNumber?: Maybe<Scalars['String']['output']>;
  last4?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
};

export type OnboardSellerAccountResponse = {
  __typename?: 'OnboardSellerAccountResponse';
  user: User;
  clientSecret: Scalars['String']['output'];
  fields: Array<Scalars['String']['output']>;
};

export type CmsListUsersResponse = {
  __typename?: 'CmsListUsersResponse';
  users: Array<User>;
  total: Scalars['Int']['output'];
};

export type CmsCreateCategoryResponse = {
  __typename?: 'CmsCreateCategoryResponse';
  category: Category;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type CmsUpdateCategoryResponse = {
  __typename?: 'CmsUpdateCategoryResponse';
  category: Category;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type PurchaseProductResponse = {
  __typename?: 'PurchaseProductResponse';
  product: Product;
  purchase: Purchase;
  reference?: Maybe<Scalars['String']['output']>;
};

export type CmsListPurchasesResponse = {
  __typename?: 'CmsListPurchasesResponse';
  purchases: Array<Purchase>;
  total: Scalars['Int']['output'];
};

export type ListBrandsResponse = {
  __typename?: 'ListBrandsResponse';
  brands: Array<Brand>;
  total: Scalars['Int']['output'];
};

export type CmsReassignBrandResponse = {
  __typename?: 'CmsReassignBrandResponse';
  fromBrand: Brand;
  toBrand: Brand;
};

export type CmsListProjectsResponse = {
  __typename?: 'CmsListProjectsResponse';
  projects: Array<Project>;
  total: Scalars['Int']['output'];
};

export type FooterSection = {
  __typename?: 'FooterSection';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  orderIndex: Scalars['Float']['output'];
  entries: Array<FooterSectionEntry>;
};

export type FooterSectionEntry = {
  __typename?: 'FooterSectionEntry';
  id: Scalars['ID']['output'];
  type: FooterSectionEntryType;
  label?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  orderIndex: Scalars['Float']['output'];
  articleId?: Maybe<Scalars['String']['output']>;
  footerSectionId: Scalars['String']['output'];
  article?: Maybe<Article>;
};

export enum FooterSectionEntryType {
  Article = 'ARTICLE',
  Link = 'LINK'
}

export type Article = {
  __typename?: 'Article';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ListArticlesResponse = {
  __typename?: 'ListArticlesResponse';
  articles: Array<Article>;
  total: Scalars['Int']['output'];
};

export type MapPinGroup = {
  __typename?: 'MapPinGroup';
  location: LocationResponse;
  prices?: Maybe<Array<Scalars['Float']['output']>>;
  type: MapPinTypeEnum;
  productIds: Array<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
};

export enum MapPinTypeEnum {
  Product = 'PRODUCT',
  Project = 'PROJECT',
  Hub = 'HUB',
  User = 'USER',
  Featured = 'FEATURED'
}

export type ProductMapPinResponse = {
  __typename?: 'ProductMapPinResponse';
  pins: Array<MapPinGroup>;
  total: Scalars['Float']['output'];
};

export type CmsCreatePartnerResponse = {
  __typename?: 'CmsCreatePartnerResponse';
  partner: Partner;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type PageContent = {
  __typename?: 'PageContent';
  id: Scalars['ID']['output'];
  page: PageEnum;
  heroHtml: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum PageEnum {
  Partner = 'PARTNER',
  Contract = 'CONTRACT'
}

export type ListPageContentResponse = {
  __typename?: 'ListPageContentResponse';
  pages: Array<PageContent>;
  total: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  usernameIsValid: Scalars['Boolean']['output'];
  me: User;
  userExists?: Maybe<User>;
  user: User;
  users: UsersResponse;
  cmsListUsers: CmsListUsersResponse;
  product: Product;
  products: ProductsResponse;
  getDraftedProduct?: Maybe<Product>;
  getOrCreateDraftProduct: Product;
  getPickupOption?: Maybe<ApproximatePlaceResponse>;
  getShippingOptions: Array<ShippingOptionResponse>;
  getDeliveryOption?: Maybe<DeliveryOptionResponse>;
  getProductPriceRange: ProductPriceRangeResponse;
  cmsGetProduct: Product;
  cmsListProducts: CmsListProductsResponse;
  category: Category;
  categories: Array<Category>;
  getCategories: Array<Category>;
  rootCategories: Array<Category>;
  popularCategories: Array<Category>;
  getConversation: Array<Message>;
  getConversations: Array<Message>;
  getUnreadConversationsCount: Scalars['Int']['output'];
  cmsListFiles: CmsListFilesResponse;
  locationToAddress: GetAddressResponse;
  locationSearch: LocationSearchResponse;
  addressToLocation: LocationResponse;
  exactAndApproximatePlace: ExactAndApproximatePlaceResponse;
  purchase: Purchase;
  latestPurchase?: Maybe<Purchase>;
  myPurchase?: Maybe<Purchase>;
  myPurchases: Array<Purchase>;
  brand: Brand;
  brands: Array<Brand>;
  listBrands: ListBrandsResponse;
  getProject: Project;
  myProjects: Array<Project>;
  cmsListProjects: CmsListProjectsResponse;
  cmsGetUserProjects: Array<Project>;
  getShippingPrice: ShippingPrice;
  getAllShippingPrices: Array<ShippingPrice>;
  getSearchResults: Array<SearchResult>;
  getSimilarSearchResults: Array<SearchResult>;
  nearbyServicePoints: Array<ServicePointResponse>;
  article: Article;
  listArticles: ListArticlesResponse;
  footerSection: FooterSection;
  listFooterSection: Array<FooterSection>;
  productMapPinsInBoundingBox: ProductMapPinResponse;
  partners: Array<Partner>;
  co2Factors: Array<Co2Factor>;
  pageContentById: PageContent;
  pageContentByPage: PageContent;
  listPageContents: ListPageContentResponse;
};


export type QueryUsernameIsValidArgs = {
  username: Scalars['String']['input'];
};


export type QueryUserExistsArgs = {
  input: UserExistsInput;
};


export type QueryUserArgs = {
  input: GetUserInput;
};


export type QueryUsersArgs = {
  input: UsersInput;
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCmsListUsersArgs = {
  input: CmsListUsersInput;
};


export type QueryProductArgs = {
  input: GetProductInput;
};


export type QueryProductsArgs = {
  input: ProductsInput;
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetPickupOptionArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryGetShippingOptionsArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryGetDeliveryOptionArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryCmsGetProductArgs = {
  productId: Scalars['String']['input'];
};


export type QueryCmsListProductsArgs = {
  input: CmsListProductsInput;
};


export type QueryCategoryArgs = {
  input: CategoryInput;
};


export type QueryCategoriesArgs = {
  input: CategoriesInput;
};


export type QueryGetCategoriesArgs = {
  input: GetCategoriesInput;
};


export type QueryRootCategoriesArgs = {
  input?: InputMaybe<RootCategoriesInput>;
};


export type QueryPopularCategoriesArgs = {
  input?: InputMaybe<PopularCategoriesInput>;
};


export type QueryGetConversationArgs = {
  input: GetConversationInput;
};


export type QueryGetConversationsArgs = {
  input: GetConversationsInput;
};


export type QueryCmsListFilesArgs = {
  input: CmsListFilesInput;
};


export type QueryLocationToAddressArgs = {
  input: GetAddressInput;
};


export type QueryLocationSearchArgs = {
  input: LocationSearchInput;
};


export type QueryAddressToLocationArgs = {
  input: AddressToLocationInput;
};


export type QueryExactAndApproximatePlaceArgs = {
  input: LocationInputType;
};


export type QueryPurchaseArgs = {
  input: GetPurchaseInput;
};


export type QueryLatestPurchaseArgs = {
  input: LatestPurchaseInput;
};


export type QueryMyPurchaseArgs = {
  input: MyPurchaseInput;
};


export type QueryMyPurchasesArgs = {
  input: MyPurchasesInput;
};


export type QueryBrandArgs = {
  id: Scalars['String']['input'];
};


export type QueryBrandsArgs = {
  input?: InputMaybe<BrandsInput>;
};


export type QueryListBrandsArgs = {
  input: ListBrandsInput;
};


export type QueryGetProjectArgs = {
  input: GetProjectInput;
};


export type QueryCmsListProjectsArgs = {
  input: CmsListProjectsInput;
};


export type QueryCmsGetUserProjectsArgs = {
  sellerId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetShippingPriceArgs = {
  input: GetShippingPriceInput;
};


export type QueryGetSearchResultsArgs = {
  input: GetSearchResultsInput;
};


export type QueryGetSimilarSearchResultsArgs = {
  input: GetSimilarSearchResultsInput;
};


export type QueryNearbyServicePointsArgs = {
  input: NearbyServicePointsInput;
};


export type QueryArticleArgs = {
  id: Scalars['String']['input'];
};


export type QueryListArticlesArgs = {
  input: ListArticlesInput;
};


export type QueryFooterSectionArgs = {
  id: Scalars['String']['input'];
};


export type QueryProductMapPinsInBoundingBoxArgs = {
  input: ProductMapPinsBoxLocationInput;
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPageContentByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryPageContentByPageArgs = {
  page: Scalars['String']['input'];
};


export type QueryListPageContentsArgs = {
  input: ListPageContentInput;
};

export type UserExistsInput = {
  email: Scalars['String']['input'];
};

export type GetUserInput = {
  id: Scalars['String']['input'];
};

export type UsersInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  hasProject?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<UserType>;
  isPromoted?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<OrderUsersEnum>;
};

export enum OrderUsersEnum {
  Alphabetical = 'ALPHABETICAL'
}

export type CmsListUsersInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type GetProductInput = {
  id: Scalars['String']['input'];
};

export type ProductsInput = {
  sellerId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInputType>;
  distance?: InputMaybe<Scalars['Float']['input']>;
  pickup?: InputMaybe<Scalars['Boolean']['input']>;
  shipping?: InputMaybe<Scalars['Boolean']['input']>;
  delivery?: InputMaybe<Scalars['Boolean']['input']>;
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['String']['input']>>;
  selectionCategories?: InputMaybe<Scalars['Boolean']['input']>;
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  giveaway?: InputMaybe<Scalars['Boolean']['input']>;
  conditions?: InputMaybe<Array<ProductConditionEnum>>;
  orderBy?: InputMaybe<OrderProductsEnum>;
  likedByUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  excludeOwnProducts?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum OrderProductsEnum {
  Distance = 'DISTANCE',
  Latest = 'LATEST',
  Oldest = 'OLDEST',
  BestMatch = 'BEST_MATCH',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC'
}

export type GetTransportationOptionsInput = {
  productId: Scalars['String']['input'];
  postCode?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
};

export type CmsListProductsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type CategoryInput = {
  id: Scalars['String']['input'];
};

export type CategoriesInput = {
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
  trending?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GetCategoriesInput = {
  parentIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RootCategoriesInput = {
  orderBy?: InputMaybe<OrderCategoriesEnum>;
};

export enum OrderCategoriesEnum {
  OrderIndexAsc = 'ORDER_INDEX_ASC',
  OrderIndexDesc = 'ORDER_INDEX_DESC'
}

export type PopularCategoriesInput = {
  limit: Scalars['Int']['input'];
};

export type GetConversationInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type GetConversationsInput = {
  type: GetConversationsType;
  productId?: InputMaybe<Scalars['String']['input']>;
};

export enum GetConversationsType {
  Selling = 'SELLING',
  Buying = 'BUYING',
  BuyingAndSelling = 'BUYING_AND_SELLING'
}

export type CmsListFilesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  fileType: FileType;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export enum FileType {
  Image = 'IMAGE',
  Document = 'DOCUMENT'
}

export type GetAddressInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type LocationSearchInput = {
  searchString: Scalars['String']['input'];
};

export type AddressToLocationInput = {
  address: Scalars['String']['input'];
};

export type GetPurchaseInput = {
  id: Scalars['String']['input'];
};

export type LatestPurchaseInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type MyPurchaseInput = {
  productId: Scalars['String']['input'];
};

export type MyPurchasesInput = {
  myRole?: InputMaybe<Scalars['String']['input']>;
};

export type BrandsInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ListBrandsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type GetProjectInput = {
  id: Scalars['String']['input'];
};

export type CmsListProjectsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type GetShippingPriceInput = {
  id: Scalars['String']['input'];
};

export type GetSearchResultsInput = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};

export type GetSimilarSearchResultsInput = {
  searchString: Scalars['String']['input'];
};

export type NearbyServicePointsInput = {
  postalCode: Scalars['String']['input'];
  amount?: InputMaybe<Scalars['Float']['input']>;
  shippingProvider: ShippingProviderEnum;
};

export type ListArticlesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type ProductMapPinsBoxLocationInput = {
  southWest: PointInput;
  northEast: PointInput;
  productsInput?: InputMaybe<ProductsInput>;
  zoom?: InputMaybe<Scalars['Int']['input']>;
};

export type PointInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type ListPageContentInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  registerUser: User;
  verifyEmail: LoginResponse;
  resendVerificationMail: ResendVerificationMailResponse;
  finalizeUser: User;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  cmsLogin: LoginResponse;
  getNewTokens: GetNewTokensResponse;
  resetPassword: ResetPasswordResponse;
  newPassword: LoginResponse;
  switchAccount: LoginResponse;
  cmsUpdateUser: User;
  updateUser: UpdateUserResponse;
  createOrganizationUser: User;
  updateOrganizationUser: User;
  deleteAccount: User;
  onboardSellerAccount: OnboardSellerAccountResponse;
  addPayoutAccount: User;
  signupNewsLetter: Scalars['Boolean']['output'];
  cmsCreateProduct: CmsCreateProductResponse;
  cmsUpdateProduct: CmsUpdateProductResponse;
  cmsHideProduct: Product;
  cmsUnhideProduct: Product;
  cmsDeleteProduct: Product;
  createProduct: CreateProductResponse;
  createDraftProduct: Product;
  updateProduct: UpdateProductResponse;
  setLikeProduct: Product;
  removeProduct: Product;
  deleteDraft: Scalars['Boolean']['output'];
  analyzeProductImage: Product;
  cmsCreateCategory: CmsCreateCategoryResponse;
  cmsUpdateCategory: CmsUpdateCategoryResponse;
  cmsUpdateCategoriesOrder: Scalars['Boolean']['output'];
  createMessage: Message;
  markConversationAsRead: Array<Message>;
  cmsCreateFiles: CmsCreateFilesResponse;
  cmsDeleteFile: File;
  cmsTestTemplate: Scalars['Boolean']['output'];
  purchaseProduct: PurchaseProductResponse;
  acceptPurchase: Purchase;
  markPurchaseAsDelivered: Purchase;
  cancelPurchase: Purchase;
  abortPurchase: Purchase;
  cmsListPurchases: CmsListPurchasesResponse;
  cmsRefundPurchase: Purchase;
  createBrandByUser: Brand;
  cmsCreateBrand: Brand;
  cmsUpdateBrand: Brand;
  cmsDeleteBrand: Scalars['Boolean']['output'];
  cmsReassignBrand: CmsReassignBrandResponse;
  deleteProject: Scalars['Boolean']['output'];
  cmsDeleteProject: Scalars['Boolean']['output'];
  cmsCreateProject: Project;
  cmsUpdateProject: Project;
  createProject: Project;
  updateProject: Project;
  setLikeProject: Project;
  createSearchResult?: Maybe<SearchResult>;
  clearSearchHistory: Scalars['Boolean']['output'];
  createReview: Review;
  createReportPurchase: ReportPurchase;
  cmsResolveReportPurchase: ReportPurchase;
  createReportProduct: ReportProduct;
  cmsCreateArticle: Article;
  cmsUpdateArticle: Article;
  cmsDeleteArticle: Scalars['Boolean']['output'];
  cmsCreateFooterSection: FooterSection;
  cmsUpdateFooterSection: FooterSection;
  cmsDeleteFooterSection: Scalars['Boolean']['output'];
  syncApproximateLocations: Scalars['Boolean']['output'];
  deleteConnectedAccount: Scalars['Boolean']['output'];
  cmsCreatePartner: CmsCreatePartnerResponse;
  cmsUpdatePartner: CmsCreatePartnerResponse;
  cmsDeletePartner: Scalars['Boolean']['output'];
  updateCO2Factors: Scalars['Boolean']['output'];
  updatePageContent: PageContent;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};


export type MutationResendVerificationMailArgs = {
  input: ResendVerificationMailInput;
};


export type MutationFinalizeUserArgs = {
  input: FinalizeUserInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  input: LogoutInput;
};


export type MutationCmsLoginArgs = {
  input: LoginInput;
};


export type MutationGetNewTokensArgs = {
  input: GetNewTokensInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationNewPasswordArgs = {
  input: NewPasswordInput;
};


export type MutationSwitchAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationCmsUpdateUserArgs = {
  input: CmsUpdateUsersInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};


export type MutationUpdateOrganizationUserArgs = {
  input: UpdateOrganizationUserInput;
};


export type MutationAddPayoutAccountArgs = {
  token: Scalars['String']['input'];
};


export type MutationSignupNewsLetterArgs = {
  email: Scalars['String']['input'];
};


export type MutationCmsCreateProductArgs = {
  input: CmsCreateProductInput;
};


export type MutationCmsUpdateProductArgs = {
  input: CmsUpdateProductInput;
};


export type MutationCmsHideProductArgs = {
  productId: Scalars['String']['input'];
  hiddenReason: Scalars['String']['input'];
};


export type MutationCmsUnhideProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCmsDeleteProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationSetLikeProductArgs = {
  input: SetLikeProductInput;
};


export type MutationRemoveProductArgs = {
  input: RemoveProductInput;
};


export type MutationDeleteDraftArgs = {
  input: RemoveProductInput;
};


export type MutationAnalyzeProductImageArgs = {
  input: AnalyzeProductImageInput;
};


export type MutationCmsCreateCategoryArgs = {
  input: CmsCreateCategoryInput;
};


export type MutationCmsUpdateCategoryArgs = {
  input: CmsUpdateCategoryInput;
};


export type MutationCmsUpdateCategoriesOrderArgs = {
  input: CmsUpdateCategoriesInput;
};


export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};


export type MutationMarkConversationAsReadArgs = {
  input: MarkAsReadInput;
};


export type MutationCmsCreateFilesArgs = {
  input: CmsCreateFilesInput;
};


export type MutationCmsDeleteFileArgs = {
  id: Scalars['String']['input'];
};


export type MutationCmsTestTemplateArgs = {
  input: CmsTestTemplateInput;
};


export type MutationPurchaseProductArgs = {
  input: PurchaseProductInput;
};


export type MutationAcceptPurchaseArgs = {
  input: AcceptPurchaseInput;
};


export type MutationMarkPurchaseAsDeliveredArgs = {
  input: MarkPurchaseAsDeliveredInput;
};


export type MutationCancelPurchaseArgs = {
  input: CancelPurchaseInput;
};


export type MutationAbortPurchaseArgs = {
  input: AbortPurchaseInput;
};


export type MutationCmsListPurchasesArgs = {
  input: CmsListPurchasesInput;
};


export type MutationCmsRefundPurchaseArgs = {
  input: CmsRefundPurchaseInput;
};


export type MutationCreateBrandByUserArgs = {
  input: CreateBrandByUserInput;
};


export type MutationCmsCreateBrandArgs = {
  input: CmsCreateBrandInput;
};


export type MutationCmsUpdateBrandArgs = {
  input: CmsUpdateBrandInput;
};


export type MutationCmsDeleteBrandArgs = {
  input: CmsBrandIdInput;
};


export type MutationCmsReassignBrandArgs = {
  input: CmsReassignBrandInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationCmsDeleteProjectArgs = {
  projectId: Scalars['String']['input'];
};


export type MutationCmsCreateProjectArgs = {
  input: CmsCreateProjectInput;
};


export type MutationCmsUpdateProjectArgs = {
  input: CmsUpdateProjectInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationSetLikeProjectArgs = {
  input: SetLikeProjectInput;
};


export type MutationCreateSearchResultArgs = {
  input: CreateSearchResultInput;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateReportPurchaseArgs = {
  input: CreateReportPurchaseInput;
};


export type MutationCmsResolveReportPurchaseArgs = {
  input: CmsResolveReportPurchaseInput;
};


export type MutationCreateReportProductArgs = {
  input: CreateReportProductInput;
};


export type MutationCmsCreateArticleArgs = {
  input: CmsCreateArticleInput;
};


export type MutationCmsUpdateArticleArgs = {
  input: CmsUpdateArticleInput;
};


export type MutationCmsDeleteArticleArgs = {
  articleId: Scalars['String']['input'];
};


export type MutationCmsCreateFooterSectionArgs = {
  input: CmsCreateFooterSectionInput;
};


export type MutationCmsUpdateFooterSectionArgs = {
  input: CmsUpdateFooterSectionInput;
};


export type MutationCmsDeleteFooterSectionArgs = {
  footerSectionId: Scalars['String']['input'];
};


export type MutationDeleteConnectedAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationCmsCreatePartnerArgs = {
  input: CmsCreatePartnerInput;
};


export type MutationCmsUpdatePartnerArgs = {
  input: CmsUpdatePartnerInput;
};


export type MutationCmsDeletePartnerArgs = {
  input: CmsDeletePartnerInput;
};


export type MutationUpdatePageContentArgs = {
  input: UpdatePageContentInput;
};

export type RegisterUserInput = {
  email: Scalars['String']['input'];
};

export type VerifyEmailInput = {
  email: Scalars['String']['input'];
  verifyEmailToken: Scalars['String']['input'];
};

export type ResendVerificationMailInput = {
  email: Scalars['String']['input'];
};

export type FinalizeUserInput = {
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LogoutInput = {
  accessToken: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type GetNewTokensInput = {
  accessToken: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  email: Scalars['String']['input'];
};

export type NewPasswordInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  resetPasswordToken: Scalars['String']['input'];
};

export type CmsUpdateUsersInput = {
  id: Scalars['String']['input'];
  role: UserRoleEnum;
  address?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  id: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<FileInputType>;
  notifyOnMessage?: InputMaybe<Scalars['Boolean']['input']>;
  notifyOnPurchaseUpdate?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FileInputType = {
  mimeType: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrganizationUserInput = {
  organizationNumber: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
};

export type UpdateOrganizationUserInput = {
  id: Scalars['String']['input'];
  organizationName?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsCreateProductInput = {
  primaryQuantity: Scalars['Float']['input'];
  primaryUnit: QuantityUnitEnum;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  isGiveaway: Scalars['Boolean']['input'];
  categoryId: Scalars['String']['input'];
  brandId: Scalars['String']['input'];
  condition: ProductConditionEnum;
  address?: InputMaybe<Scalars['String']['input']>;
  noProject: Scalars['Boolean']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<MeasurementInput>;
  pickupEnabled: Scalars['Boolean']['input'];
  deliveryEnabled: Scalars['Boolean']['input'];
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  images: Array<FileInputType>;
  documents: Array<FileInputType>;
};

export type MeasurementInput = {
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<MeasurementUnitEnum>;
  width?: InputMaybe<Scalars['Float']['input']>;
  widthUnit?: InputMaybe<MeasurementUnitEnum>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lengthUnit?: InputMaybe<MeasurementUnitEnum>;
  thickness?: InputMaybe<Scalars['Float']['input']>;
  thicknessUnit?: InputMaybe<MeasurementUnitEnum>;
  diameter?: InputMaybe<Scalars['Float']['input']>;
  diameterUnit?: InputMaybe<MeasurementUnitEnum>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<MeasurementUnitEnum>;
};

export type CmsUpdateProductInput = {
  primaryQuantity: Scalars['Float']['input'];
  primaryUnit: QuantityUnitEnum;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  isGiveaway: Scalars['Boolean']['input'];
  categoryId: Scalars['String']['input'];
  brandId: Scalars['String']['input'];
  condition: ProductConditionEnum;
  address?: InputMaybe<Scalars['String']['input']>;
  noProject: Scalars['Boolean']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<MeasurementInput>;
  pickupEnabled: Scalars['Boolean']['input'];
  deliveryEnabled: Scalars['Boolean']['input'];
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  id: Scalars['String']['input'];
  addImages?: InputMaybe<Array<FileInputType>>;
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  addDocuments?: InputMaybe<Array<FileInputType>>;
  removeDocuments?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateProductInput = {
  title: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  address: Scalars['String']['input'];
  images?: InputMaybe<Array<FileInputType>>;
  isGiveaway?: InputMaybe<Scalars['Boolean']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['Float']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
  depth?: InputMaybe<Scalars['Float']['input']>;
  volume?: InputMaybe<Scalars['Float']['input']>;
  condition: ProductConditionEnum;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  id: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInputType>;
  description?: InputMaybe<Scalars['String']['input']>;
  additionalInfo?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  isGiveAway?: InputMaybe<Scalars['Boolean']['input']>;
  primaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  primaryUnit?: InputMaybe<QuantityUnitEnum>;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<MeasurementUnitEnum>;
  width?: InputMaybe<Scalars['Float']['input']>;
  widthUnit?: InputMaybe<MeasurementUnitEnum>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lengthUnit?: InputMaybe<MeasurementUnitEnum>;
  thickness?: InputMaybe<Scalars['Float']['input']>;
  thicknessUnit?: InputMaybe<MeasurementUnitEnum>;
  diameter?: InputMaybe<Scalars['Float']['input']>;
  diameterUnit?: InputMaybe<MeasurementUnitEnum>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<MeasurementUnitEnum>;
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  condition?: InputMaybe<ProductConditionEnum>;
  status?: InputMaybe<ProductStatusEnum>;
  addImages?: InputMaybe<Array<FileInputType>>;
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  addDocuments?: InputMaybe<Array<FileInputType>>;
  removeDocuments?: InputMaybe<Array<Scalars['String']['input']>>;
  noProject?: InputMaybe<Scalars['Boolean']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  deliveryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  pickupEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SetLikeProductInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
};

export type RemoveProductInput = {
  id: Scalars['String']['input'];
};

export type AnalyzeProductImageInput = {
  productId: Scalars['String']['input'];
  imageIndex: Scalars['Float']['input'];
};

export type CmsCreateCategoryInput = {
  image?: InputMaybe<FileInputType>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  co2FactorId?: InputMaybe<Scalars['String']['input']>;
  inSelection: Scalars['Boolean']['input'];
  inSeason: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
  measurements: Array<MeasurementTypeEnum>;
};

export type CmsUpdateCategoryInput = {
  image?: InputMaybe<FileInputType>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  co2FactorId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  inSelection?: InputMaybe<Scalars['Boolean']['input']>;
  inSeason?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Array<MeasurementTypeEnum>>;
};

export type CmsUpdateCategoriesInput = {
  updateInputs: Array<CmsUpdateCategoryOrderInput>;
};

export type CmsUpdateCategoryOrderInput = {
  id: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
};

export type CreateMessageInput = {
  receiverId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  message: Scalars['String']['input'];
  images?: InputMaybe<Array<FileInputType>>;
  documents?: InputMaybe<Array<FileInputType>>;
};

export type MarkAsReadInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  markAsRead: Scalars['Boolean']['input'];
};

export type CmsCreateFilesInput = {
  files?: InputMaybe<Array<FileInputType>>;
};

export type CmsTestTemplateInput = {
  template: Scalars['String']['input'];
};

export type PurchaseProductInput = {
  productId: Scalars['String']['input'];
  paymentMethod?: InputMaybe<PaymentMethod>;
  servicePointId?: InputMaybe<Scalars['String']['input']>;
  shippingProvider?: InputMaybe<ShippingProviderEnum>;
  deliverToLocation?: InputMaybe<LocationInputType>;
  deliverToAddress?: InputMaybe<Scalars['String']['input']>;
  transportationMethod: TransportationEnum;
  successUrl?: InputMaybe<Scalars['String']['input']>;
  failureUrl?: InputMaybe<Scalars['String']['input']>;
};

export type AcceptPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type MarkPurchaseAsDeliveredInput = {
  purchaseId: Scalars['String']['input'];
};

export type CancelPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type AbortPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CmsListPurchasesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PurchaseStatusEnum>;
};

export type CmsRefundPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CreateBrandByUserInput = {
  name: Scalars['String']['input'];
  categoryId?: InputMaybe<Scalars['String']['input']>;
};

export type CmsCreateBrandInput = {
  name: Scalars['String']['input'];
};

export type CmsUpdateBrandInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CmsBrandIdInput = {
  id: Scalars['String']['input'];
};

export type CmsReassignBrandInput = {
  fromBrandId: Scalars['String']['input'];
  toBrandId: Scalars['String']['input'];
};

export type DeleteProjectInput = {
  id: Scalars['String']['input'];
};

export type CmsCreateProjectInput = {
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  shortText?: InputMaybe<Scalars['String']['input']>;
  address: Scalars['String']['input'];
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CmsUpdateProjectInput = {
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  shortText?: InputMaybe<Scalars['String']['input']>;
  address: Scalars['String']['input'];
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
};

export type CreateProjectInput = {
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  shortText?: InputMaybe<Scalars['String']['input']>;
  location: LocationInputType;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  id: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  shortText?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInputType>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SetLikeProjectInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
};

export type CreateSearchResultInput = {
  searchString: Scalars['String']['input'];
};

export type CreateReviewInput = {
  purchaseId: Scalars['String']['input'];
  review: Scalars['String']['input'];
  stars: Scalars['Int']['input'];
};

export type CreateReportPurchaseInput = {
  purchaseId: Scalars['String']['input'];
  type: ReportPurchaseTypeEnum;
  message: Scalars['String']['input'];
};

export type CmsResolveReportPurchaseInput = {
  reportPurchaseId: Scalars['String']['input'];
  resolution: ReportPurchaseResolutionEnum;
};

export type CreateReportProductInput = {
  productId: Scalars['String']['input'];
  type: ReportProductTypeEnum;
  message: Scalars['String']['input'];
};

export type CmsCreateArticleInput = {
  title: Scalars['String']['input'];
  body: Scalars['String']['input'];
};

export type CmsUpdateArticleInput = {
  id: Scalars['String']['input'];
  title: Scalars['String']['input'];
  body: Scalars['String']['input'];
};

export type CmsCreateFooterSectionInput = {
  title: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
  entries: Array<FooterEntryInput>;
};

export type FooterEntryInput = {
  type: FooterSectionEntryType;
  orderIndex: Scalars['Int']['input'];
  articleId?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUpdateFooterSectionInput = {
  id: Scalars['String']['input'];
  title: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
  entries: Array<FooterEntryInput>;
};

export type CmsCreatePartnerInput = {
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
  logo: FileInputType;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUpdatePartnerInput = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<FileInputType>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsDeletePartnerInput = {
  id: Scalars['String']['input'];
};

export type UpdatePageContentInput = {
  id: Scalars['String']['input'];
  heroHtml: Scalars['String']['input'];
};

export type GetNewTokensMutationVariables = Exact<{
  input: GetNewTokensInput;
}>;


export type GetNewTokensMutation = { __typename?: 'Mutation', getNewTokens: { __typename?: 'GetNewTokensResponse', accessToken: string, refreshToken: string } };

export type GetProjectQueryVariables = Exact<{
  input: GetProjectInput;
  searchString?: InputMaybe<Scalars['String']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type GetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, likedByMe?: boolean | null, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string }, projectPicture?: { __typename?: 'File', id: string, url: string } | null, user: { __typename?: 'User', id: string, username?: string | null, type: UserType, rating?: number | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, category?: { __typename?: 'Category', id: string, name: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }> }, me?: { __typename?: 'User', id: string, type: UserType, isFeatured: boolean } };

export type MapPinsQueryVariables = Exact<{
  input: ProductMapPinsBoxLocationInput;
}>;


export type MapPinsQuery = { __typename?: 'Query', productMapPinsInBoundingBox: { __typename?: 'ProductMapPinResponse', total: number, pins: Array<{ __typename?: 'MapPinGroup', prices?: Array<number> | null, type: MapPinTypeEnum, productIds: Array<string>, projectId?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number } }> } };

export type MapProductQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type MapProductQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, price: number, likedByMe?: boolean | null, sellerId: string, seller: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, primaryImage?: { __typename?: 'File', id: string, url: string } | null, project?: { __typename?: 'Project', id: string, title: string, description?: string | null, shortText?: string | null, showDetailsOnMap: boolean } | null } };

export type SearchProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
  distanceFrom?: InputMaybe<LocationInputType>;
}>;


export type SearchProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, distanceFromLocation?: number | null, likedByMe?: boolean | null, brand?: { __typename?: 'Brand', id: string, name: string } | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> }, me?: { __typename?: 'User', id: string, address?: string | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null } };

export type ProfileQueryVariables = Exact<{
  input: GetUserInput;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type ProfileQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, username?: string | null, description?: string | null, type: UserType, numberOfSoldProducts: number, numberOfPublishedProducts: number, rating?: number | null, totalCO2Savings: number, projects: Array<{ __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }>, profilePicture?: { __typename?: 'File', id: string, url: string } | null, reviewed: Array<{ __typename?: 'Review', id: string, createdAt: any, review: string, stars: number, purchase: { __typename?: 'Purchase', id: string, buyerId: string }, reviewer: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }> }, me?: { __typename?: 'User', id: string } };

export type ProfileProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProfileProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, title: string, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }> } };

export type ProfileUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type ProfileUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', profilePicturePutUrl?: string | null, user: { __typename?: 'User', id: string, description?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } };

export type ProductViewFragmentFragment = { __typename?: 'Product', id: string, status: ProductStatusEnum, createdAt: any, updatedAt: any, canDelete: boolean, likedByMe?: boolean | null, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, co2Saving?: number | null, hasOngoingPurchase: boolean, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string>, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string }, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null, seller: { __typename?: 'User', id: string, type: UserType, username?: string | null, rating?: number | null, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> } };

export type RootCategoriesQueryVariables = Exact<{
  input: RootCategoriesInput;
}>;


export type RootCategoriesQuery = { __typename?: 'Query', rootCategories: Array<{ __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null, children: Array<{ __typename?: 'Category', id: string, parentId?: string | null }> }> };

export type SubCategoriesQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type SubCategoriesQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, description: string, parentId?: string | null, parent?: { __typename?: 'Category', id: string, name: string } | null, children: Array<{ __typename?: 'Category', id: string, name: string, parentId?: string | null, image?: { __typename?: 'File', id: string, url: string } | null }> } };

export type UseCreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationUserInput;
}>;


export type UseCreateOrganizationMutation = { __typename?: 'Mutation', createOrganizationUser: { __typename?: 'User', id: string, username?: string | null, organizationNumber?: string | null } };

export type ProjectLikeMutationVariables = Exact<{
  input: SetLikeProjectInput;
}>;


export type ProjectLikeMutation = { __typename?: 'Mutation', setLikeProject: { __typename?: 'Project', id: string, likedByMe?: boolean | null } };

export type LogoutMutationVariables = Exact<{
  input: LogoutInput;
}>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type LocationSearchQueryQueryVariables = Exact<{
  input: LocationSearchInput;
}>;


export type LocationSearchQueryQuery = { __typename?: 'Query', locationSearch: { __typename?: 'LocationSearchResponse', result: Array<string> } };

export type AddressToLocationQueryQueryVariables = Exact<{
  input: AddressToLocationInput;
}>;


export type AddressToLocationQueryQuery = { __typename?: 'Query', addressToLocation: { __typename?: 'LocationResponse', lat: number, lng: number } };

export type LocationToAddressQueryVariables = Exact<{
  input: GetAddressInput;
}>;


export type LocationToAddressQuery = { __typename?: 'Query', locationToAddress: { __typename?: 'GetAddressResponse', address: string } };

export type ProductViewLikeProductMutationVariables = Exact<{
  input: SetLikeProductInput;
}>;


export type ProductViewLikeProductMutation = { __typename?: 'Mutation', setLikeProduct: { __typename?: 'Product', id: string, likedByMe?: boolean | null } };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, type: UserType, description?: string | null, numberOfSoldProducts: number, numberOfPublishedProducts: number, rating?: number | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } };

export type SummaryCreateFreePurchaseMutationVariables = Exact<{
  input: PurchaseProductInput;
}>;


export type SummaryCreateFreePurchaseMutation = { __typename?: 'Mutation', purchaseProduct: { __typename?: 'PurchaseProductResponse', purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum } } };

export type ProductRemoveProductMutationVariables = Exact<{
  input: RemoveProductInput;
}>;


export type ProductRemoveProductMutation = { __typename?: 'Mutation', removeProduct: { __typename?: 'Product', id: string, status: ProductStatusEnum, createdAt: any, updatedAt: any, canDelete: boolean, likedByMe?: boolean | null, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, co2Saving?: number | null, hasOngoingPurchase: boolean, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string>, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string }, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null, seller: { __typename?: 'User', id: string, type: UserType, username?: string | null, rating?: number | null, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> } } };

export type CreateMessageMutationVariables = Exact<{
  input: CreateMessageInput;
}>;


export type CreateMessageMutation = { __typename?: 'Mutation', createMessage: { __typename?: 'Message', id: string, message: string, messageType: MessageTypeEnum, createdAt: any, imagePutUrls?: Array<string> | null, documentPutUrls?: Array<string> | null, sender: { __typename?: 'User', id: string, type: UserType, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } };

export type MarkConversationAsReadMutationVariables = Exact<{
  input: MarkAsReadInput;
}>;


export type MarkConversationAsReadMutation = { __typename?: 'Mutation', markConversationAsRead: Array<{ __typename?: 'Message', id: string, readAt?: any | null }> };

export type OnboardSellerAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type OnboardSellerAccountMutation = { __typename?: 'Mutation', onboardSellerAccount: { __typename?: 'OnboardSellerAccountResponse', clientSecret: string, fields: Array<string>, user: { __typename?: 'User', id: string } } };

export type TabLayoutQueryVariables = Exact<{ [key: string]: never; }>;


export type TabLayoutQuery = { __typename?: 'Query', getUnreadConversationsCount: number };

export type NewPasswordMutationVariables = Exact<{
  input: NewPasswordInput;
}>;


export type NewPasswordMutation = { __typename?: 'Mutation', newPassword: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string } };

export type AppQueryQueryVariables = Exact<{
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type AppQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, registrationStatus: RegisterStatusEnum } };

export type GetProductQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type GetProductQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, description?: string | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, height?: number | null, heightUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, category?: { __typename?: 'Category', id: string, name: string, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, seller: { __typename?: 'User', id: string, name?: string | null, username?: string | null, profilePicture?: { __typename?: 'File', id: string, name?: string | null, url: string } | null } } };

export type GetArticleQueryVariables = Exact<{
  articleId: Scalars['String']['input'];
}>;


export type GetArticleQuery = { __typename?: 'Query', article: { __typename?: 'Article', id: string, title: string, body: string } };

export type HubsQueryVariables = Exact<{
  input: UsersInput;
}>;


export type HubsQuery = { __typename?: 'Query', users: { __typename?: 'UsersResponse', total: number, users: Array<{ __typename?: 'User', id: string, username?: string | null, description?: string | null, websiteUrl?: string | null, isFeatured: boolean, profilePicture?: { __typename?: 'File', id: string, url: string } | null, projects: Array<{ __typename?: 'Project', id: string, title: string, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } }> }> } };

export type PartnersPageQueryVariables = Exact<{
  page: Scalars['String']['input'];
}>;


export type PartnersPageQuery = { __typename?: 'Query', partners: Array<{ __typename?: 'Partner', id: string, name: string, description: string, websiteUrl?: string | null, logo: { __typename?: 'File', id: string, url: string } }>, pageContentByPage: { __typename?: 'PageContent', id: string, page: PageEnum, heroHtml: string } };

export type HubQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type HubQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number } } };

export type ProductViewQueryVariables = Exact<{
  input: GetProductInput;
  isLoggedIn: Scalars['Boolean']['input'];
  distanceFrom?: InputMaybe<LocationInputType>;
}>;


export type ProductViewQuery = { __typename?: 'Query', product: { __typename?: 'Product', distanceFromLocation?: number | null, id: string, status: ProductStatusEnum, createdAt: any, updatedAt: any, canDelete: boolean, likedByMe?: boolean | null, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, co2Saving?: number | null, hasOngoingPurchase: boolean, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string>, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string }, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null, seller: { __typename?: 'User', id: string, type: UserType, username?: string | null, rating?: number | null, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> } }, me?: { __typename?: 'User', id: string, address?: string | null, type: UserType } };

export type ProductListQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductListQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, title: string, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, rating?: number | null, type: UserType } }> }, me: { __typename?: 'User', id: string } };

export type GetProjectsQueryVariables = Exact<{
  input: GetUserInput;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type GetProjectsQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, username?: string | null, projects: Array<{ __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }> }, me?: { __typename?: 'User', id: string } };

export type GetConversationsQueryVariables = Exact<{
  input: GetConversationsInput;
}>;


export type GetConversationsQuery = { __typename?: 'Query', getConversations: Array<{ __typename?: 'Message', id: string, message: string, readAt?: any | null, createdAt: any, messageType: MessageTypeEnum, sender: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, product: { __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, seller: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } }>, me: { __typename?: 'User', id: string } };

export type GetFavoriteProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFavoriteProjectsQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, likedProjects?: Array<{ __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }> | null } };

export type AccountPurchasesQueryVariables = Exact<{
  input: MyPurchasesInput;
}>;


export type AccountPurchasesQuery = { __typename?: 'Query', myPurchases: Array<{ __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, paymentAcceptedAt?: any | null, sellerRespondedAt?: any | null, transportationMethod: TransportationEnum, deliveredAt?: any | null, approvedAt?: any | null, failedAt?: any | null, product: { __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, seller: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }, reportPurchase?: { __typename?: 'ReportPurchase', id: string, resolution?: ReportPurchaseResolutionEnum | null } | null }> };

export type PurchasesPurchaseReceiptQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type PurchasesPurchaseReceiptQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, sellerRespondedAt?: any | null, transportationMethod: TransportationEnum, product: { __typename?: 'Product', id: string, status: ProductStatusEnum } } };

export type SalesPurchaseReceiptQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type SalesPurchaseReceiptQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, sellerRespondedAt?: any | null, transportationMethod: TransportationEnum, product: { __typename?: 'Product', id: string, status: ProductStatusEnum } } };

export type SettingsUserFragmentFragment = { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null };

export type SettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsQuery = { __typename?: 'Query', me: { __typename?: 'User', sellerAccountIsEnabled: boolean, id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, organizationAccount?: { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null } | null, organizationOwner?: { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null } | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } };

export type SwitchAccountMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SwitchAccountMutation = { __typename?: 'Mutation', switchAccount: { __typename?: 'LoginResponse', refreshToken: string, accessToken: string, user: { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } };

export type AccountSalesQueryVariables = Exact<{
  input: MyPurchasesInput;
}>;


export type AccountSalesQuery = { __typename?: 'Query', myPurchases: Array<{ __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, paymentAcceptedAt?: any | null, sellerRespondedAt?: any | null, transportationMethod: TransportationEnum, deliveredAt?: any | null, failedAt?: any | null, buyer: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, product: { __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null }, reportPurchase?: { __typename?: 'ReportPurchase', id: string, resolution?: ReportPurchaseResolutionEnum | null } | null }> };

export type ShippingCodeQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type ShippingCodeQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, qrCodeUrl?: string | null, qrCodeContent?: string | null } };

export type ConversationsQueryVariables = Exact<{
  input: GetConversationsInput;
}>;


export type ConversationsQuery = { __typename?: 'Query', getConversations: Array<{ __typename?: 'Message', id: string, message: string, readAt?: any | null, createdAt: any, sender: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, product: { __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null } }>, me: { __typename?: 'User', id: string } };

export type BuyProductInitialQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type BuyProductInitialQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, pickupEnabled: boolean, deliveryEnabled: boolean, deliveryPrice?: number | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, provider: ShippingProviderEnum, price: number }> | null }, me: { __typename?: 'User', id: string, name?: string | null, phoneNumber?: string | null, address?: string | null, postCode?: string | null, city?: string | null } };

export type BuyProductTransportationOptionsQueryVariables = Exact<{
  input: GetTransportationOptionsInput;
}>;


export type BuyProductTransportationOptionsQuery = { __typename?: 'Query', getPickupOption?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, getShippingOptions: Array<{ __typename?: 'ShippingOptionResponse', shippingPrice: { __typename?: 'ShippingPrice', id: string, price: number, provider: ShippingProviderEnum }, servicePoints: Array<{ __typename?: 'ServicePointResponse', id: string, name: string, distance: number, streetName: string, streetNumber: string, postalCode: string, city: string }> }>, getDeliveryOption?: { __typename?: 'DeliveryOptionResponse', isWithinRadius: boolean, distanceFromProduct: number, deliveryPrice: number } | null };

export type PurchaseSuccessQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type PurchaseSuccessQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, boughtForFree: boolean }, me: { __typename?: 'User', id: string, email?: string | null } };

export type BuyProductPaymentQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type BuyProductPaymentQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, pickupEnabled: boolean, deliveryEnabled: boolean, deliveryPrice?: number | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, price: number }> | null }, me: { __typename?: 'User', id: string, email?: string | null } };

export type BuyProductCreatePurchaseMutationVariables = Exact<{
  input: PurchaseProductInput;
}>;


export type BuyProductCreatePurchaseMutation = { __typename?: 'Mutation', purchaseProduct: { __typename?: 'PurchaseProductResponse', reference?: string | null, purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum } } };

export type PaymentCancelPurchaseMutationVariables = Exact<{
  input: CancelPurchaseInput;
}>;


export type PaymentCancelPurchaseMutation = { __typename?: 'Mutation', cancelPurchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum } };

export type SearchInSeasonQueryVariables = Exact<{
  input: CategoriesInput;
}>;


export type SearchInSeasonQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, parentId?: string | null, children: Array<{ __typename?: 'Category', id: string, parentId?: string | null }> }> };

export type PollStripeQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type PollStripeQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum } };

export type DeleteAccountMeQueryVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMutation = { __typename?: 'Mutation', deleteAccount: { __typename?: 'User', id: string } };

export type AccountSettingsNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsNotificationsQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email?: string | null, notifyOnMessage: boolean, notifyOnPurchaseUpdate: boolean } };

export type AccountSettingsUpdateNotificationsMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type AccountSettingsUpdateNotificationsMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, notifyOnMessage: boolean, notifyOnPurchaseUpdate: boolean } } };

export type AccountSettingsLayoutPayoutQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsLayoutPayoutQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type AddBankPayoutAccountMeQueryVariables = Exact<{ [key: string]: never; }>;


export type AddBankPayoutAccountMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, name?: string | null } };

export type AddBankPayoutAccountMutationVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type AddBankPayoutAccountMutation = { __typename?: 'Mutation', addPayoutAccount: { __typename?: 'User', id: string } };

export type AccountSettingsPayoutQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsPayoutQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType, payoutAccount?: { __typename?: 'PayoutAccount', type: string, routingNumber?: string | null, bankName?: string | null, last4?: string | null } | null } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfSoldProducts: number, numberOfPublishedProducts: number, rating?: number | null, products: Array<{ __typename?: 'Product', id: string }>, projects: Array<{ __typename?: 'Project', id: string }>, likedProducts?: { __typename?: 'ProductsResponse', total: number } | null, sales: Array<{ __typename?: 'Purchase', id: string }>, purchases: Array<{ __typename?: 'Purchase', id: string }>, profilePicture?: { __typename?: 'File', id: string, url: string } | null } };

export type AdRowSectionQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
  distanceFrom?: InputMaybe<LocationInputType>;
}>;


export type AdRowSectionQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, distanceFromLocation?: number | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, category?: { __typename?: 'Category', id: string, name: string } | null, seller: { __typename?: 'User', id: string } }> }, me?: { __typename?: 'User', id: string } };

export type BuyProductDeliveryOptionCardQueryVariables = Exact<{
  input: GetTransportationOptionsInput;
}>;


export type BuyProductDeliveryOptionCardQuery = { __typename?: 'Query', getDeliveryOption?: { __typename?: 'DeliveryOptionResponse', isWithinRadius: boolean, distanceFromProduct: number, deliveryPrice: number, postalCode?: string | null, deliverToLocation: { __typename?: 'LocationResponse', lat: number, lng: number } } | null };

export type BuyProductDeliveryOptionSingleQueryVariables = Exact<{
  input: GetTransportationOptionsInput;
}>;


export type BuyProductDeliveryOptionSingleQuery = { __typename?: 'Query', getDeliveryOption?: { __typename?: 'DeliveryOptionResponse', isWithinRadius: boolean, distanceFromProduct: number, deliveryPrice: number, postalCode?: string | null, deliverToLocation: { __typename?: 'LocationResponse', lat: number, lng: number } } | null };

export type ShippingDetailsUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type ShippingDetailsUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, name?: string | null, phoneNumber?: string | null, address?: string | null, postCode?: string | null, city?: string | null } } };

export type SinglePickupOptionQueryVariables = Exact<{
  productInput: GetProductInput;
  optionInput: GetTransportationOptionsInput;
}>;


export type SinglePickupOptionQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, price: number }, getPickupOption?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null };

export type BuySingleShippingOptionQueryVariables = Exact<{
  input: GetTransportationOptionsInput;
}>;


export type BuySingleShippingOptionQuery = { __typename?: 'Query', getShippingOptions: Array<{ __typename?: 'ShippingOptionResponse', shippingPrice: { __typename?: 'ShippingPrice', id: string, price: number, provider: ShippingProviderEnum }, servicePoints: Array<{ __typename?: 'ServicePointResponse', id: string, name: string, distance: number, streetName: string, streetNumber: string, postalCode: string, city: string }> }> };

export type ComingSoonSignUpMutationVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type ComingSoonSignUpMutation = { __typename?: 'Mutation', signupNewsLetter: boolean };

export type ConversationAcceptPurchaseMutationVariables = Exact<{
  input: AcceptPurchaseInput;
}>;


export type ConversationAcceptPurchaseMutation = { __typename?: 'Mutation', acceptPurchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, approvedAt?: any | null } };

export type ConversationMarkAsDeliveredMutationVariables = Exact<{
  input: MarkPurchaseAsDeliveredInput;
}>;


export type ConversationMarkAsDeliveredMutation = { __typename?: 'Mutation', markPurchaseAsDelivered: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, deliveredAt?: any | null } };

export type ForTheSeasonCategoriesQueryVariables = Exact<{
  input: CategoriesInput;
}>;


export type ForTheSeasonCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, parentId?: string | null, image?: { __typename?: 'File', id: string, url: string } | null }> };

export type BrandFilterQueryVariables = Exact<{ [key: string]: never; }>;


export type BrandFilterQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum }> };

export type CategoryFilterQueryVariables = Exact<{
  input: GetCategoriesInput;
}>;


export type CategoryFilterQuery = { __typename?: 'Query', getCategories: Array<{ __typename?: 'Category', id: string, parentId?: string | null, name: string }> };

export type RootCategoryFilterQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategoryFilterQuery = { __typename?: 'Query', rootCategories: Array<{ __typename?: 'Category', id: string, name: string, children: Array<{ __typename?: 'Category', id: string }> }> };

export type PriceFilterQueryVariables = Exact<{ [key: string]: never; }>;


export type PriceFilterQuery = { __typename?: 'Query', getProductPriceRange: { __typename?: 'ProductPriceRangeResponse', min: number, max: number } };

export type HamburgerMenuQueryVariables = Exact<{
  input: CategoriesInput;
}>;


export type HamburgerMenuQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, parentId?: string | null, inSelection: boolean, inSeason: boolean, image?: { __typename?: 'File', id: string, url: string } | null }> };

export type DetailsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DetailsQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email?: string | null } };

export type UpdateDetailsFieldsMutationVariables = Exact<{
  input: FinalizeUserInput;
}>;


export type UpdateDetailsFieldsMutation = { __typename?: 'Mutation', finalizeUser: { __typename?: 'User', id: string, username?: string | null } };

export type DetailsValidUsernameQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type DetailsValidUsernameQuery = { __typename?: 'Query', usernameIsValid: boolean };

export type CreateBusinessQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateBusinessQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string } };

export type VerifyEmailMutationVariables = Exact<{
  input: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: string } } };

export type ResendVerificationMailMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type ResendVerificationMailMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'User', id: string } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', email?: string | null } } };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'ResetPasswordResponse', message: string } };

export type UserExistsQueryVariables = Exact<{
  input: UserExistsInput;
}>;


export type UserExistsQuery = { __typename?: 'Query', userExists?: { __typename?: 'User', registrationStatus: RegisterStatusEnum } | null };

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'User', id: string } };

export type ListFooterSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type ListFooterSectionQuery = { __typename?: 'Query', listFooterSection: Array<{ __typename?: 'FooterSection', id: string, title: string, orderIndex: number, entries: Array<{ __typename?: 'FooterSectionEntry', id: string, articleId?: string | null, footerSectionId: string, orderIndex: number, type: FooterSectionEntryType, url?: string | null, label?: string | null, article?: { __typename?: 'Article', id: string, title: string } | null }> }> };

export type PayoutCheckSellerAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type PayoutCheckSellerAccountQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, sellerAccountIsEnabled: boolean } };

export type CategorySectionQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type CategorySectionQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, children: Array<{ __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null }> } };

export type CategorySectionSelectedCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type CategorySectionSelectedCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null } };

export type BrandSectionQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type BrandSectionQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum }>, category: { __typename?: 'Category', id: string, brands: Array<{ __typename?: 'Brand', id: string, name: string }> } };

export type BrandSectionSearchBrandQueryVariables = Exact<{
  input: BrandsInput;
}>;


export type BrandSectionSearchBrandQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum }> };

export type CreateBrandByUserMutationVariables = Exact<{
  input: CreateBrandByUserInput;
}>;


export type CreateBrandByUserMutation = { __typename?: 'Mutation', createBrandByUser: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } };

export type MeasurementsSectionQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type MeasurementsSectionQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, measurements: Array<MeasurementTypeEnum> } };

export type RecommendedQuantitiesQueryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type RecommendedQuantitiesQueryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, primaryQuantityUnit?: QuantityUnitEnum | null, secondaryQuantityUnit?: QuantityUnitEnum | null } };

export type RootCategorySectionQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategorySectionQuery = { __typename?: 'Query', rootCategories: Array<{ __typename?: 'Category', id: string, name: string, description: string, orderIndex: number, image?: { __typename?: 'File', id: string, url: string } | null }> };

export type RootCategorySelectedCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type RootCategorySelectedCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, description: string, image?: { __typename?: 'File', id: string, url: string } | null } };

export type EditProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type EditProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, shortText?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, showDetailsOnMap: boolean, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type UpdateProjectMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', id: string, title: string, description?: string | null, shortText?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, showDetailsOnMap: boolean, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type CreateProjectQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateProjectQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, address?: string | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null } };

export type CreateProjectMutationMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutationMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string, title: string, description?: string | null, shortText?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type DeleteProjectMutationVariables = Exact<{
  input: DeleteProjectInput;
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject: boolean };

export type PreviewProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type PreviewProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } }, me: { __typename?: 'User', id: string, type: UserType, isFeatured: boolean } };

export type ProjectsListFragmentFragment = { __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } };

export type AbortPurchaseMutationVariables = Exact<{
  input: AbortPurchaseInput;
}>;


export type AbortPurchaseMutation = { __typename?: 'Mutation', abortPurchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, abortedById?: string | null, isRefunded: boolean } };

export type PurchaseReceiptQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type PurchaseReceiptQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, createdAt: any, paymentAcceptedAt?: any | null, shipmentDroppedOffAt?: any | null, shipmentDeliveredAt?: any | null, sellerRespondedAt?: any | null, deliveredAt?: any | null, approvedAt?: any | null, pausedAt?: any | null, failedAt?: any | null, paymentMethod?: PaymentMethod | null, transportationMethod: TransportationEnum, isFree: boolean, isRefunded: boolean, abortedById?: string | null, boughtForFree: boolean, qrCodeUrl?: string | null, qrCodeContent?: string | null, shippingPrice?: { __typename?: 'ShippingPrice', id: string, price: number, maxWeight: number, provider: ShippingProviderEnum } | null, product: { __typename?: 'Product', id: string, status: ProductStatusEnum, title: string, price: number, deliveryPrice?: number | null, seller: { __typename?: 'User', id: string, username?: string | null }, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }> }, buyer: { __typename?: 'User', id: string, username?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, reviews: Array<{ __typename?: 'Review', id: string, reviewerId: string, revieweeId: string }>, reportPurchase?: { __typename?: 'ReportPurchase', id: string, resolution?: ReportPurchaseResolutionEnum | null } | null }, me: { __typename?: 'User', id: string, email?: string | null, type: UserType } };

export type ApprovePurchaseMutationVariables = Exact<{
  input: AcceptPurchaseInput;
}>;


export type ApprovePurchaseMutation = { __typename?: 'Mutation', acceptPurchase: { __typename?: 'Purchase', id: string, approvedAt?: any | null, status: PurchaseStatusEnum } };

export type ReceiptMarkAsDeliveredMutationVariables = Exact<{
  input: MarkPurchaseAsDeliveredInput;
}>;


export type ReceiptMarkAsDeliveredMutation = { __typename?: 'Mutation', markPurchaseAsDelivered: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, deliveredAt?: any | null } };

export type RecommendedProductsQueryVariables = Exact<{
  input: RecommendedProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RecommendedProductsQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, recommendedProducts: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, brand?: { __typename?: 'Brand', id: string, name: string } | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, category?: { __typename?: 'Category', id: string, name: string, parentId?: string | null } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> } };

export type ReportPurchaseQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type ReportPurchaseQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, buyerId: string, status: PurchaseStatusEnum, product: { __typename?: 'Product', id: string, title: string, price: number, status: ProductStatusEnum, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null }, reportPurchase?: { __typename?: 'ReportPurchase', id: string } | null }, me: { __typename?: 'User', id: string } };

export type CreateReportPurchaseMutationVariables = Exact<{
  input: CreateReportPurchaseInput;
}>;


export type CreateReportPurchaseMutation = { __typename?: 'Mutation', createReportPurchase: { __typename?: 'ReportPurchase', id: string } };

export type ReportProductQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type ReportProductQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, price: number, status: ProductStatusEnum, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, reportProducts: Array<{ __typename?: 'ReportProduct', id: string, reporterId: string }> }, me: { __typename?: 'User', id: string } };

export type CreateReportProductMutationVariables = Exact<{
  input: CreateReportProductInput;
}>;


export type CreateReportProductMutation = { __typename?: 'Mutation', createReportProduct: { __typename?: 'ReportProduct', id: string, reporterId: string } };

export type CreateReviewQueryVariables = Exact<{
  input: GetPurchaseInput;
}>;


export type CreateReviewQuery = { __typename?: 'Query', purchase: { __typename?: 'Purchase', id: string, buyerId: string, product: { __typename?: 'Product', id: string, title: string, sellerId: string, primaryImage?: { __typename?: 'File', id: string, url: string } | null } }, me: { __typename?: 'User', id: string } };

export type CreateReviewCreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewCreateReviewMutation = { __typename?: 'Mutation', createReview: { __typename?: 'Review', id: string, stars: number, review: string } };

export type SellProductDeleteMutationVariables = Exact<{
  input: RemoveProductInput;
}>;


export type SellProductDeleteMutation = { __typename?: 'Mutation', deleteDraft: boolean };

export type SellProductQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SellProductQueryQuery = { __typename?: 'Query', getOrCreateDraftProduct: { __typename?: 'Product', id: string } };

export type SimilarProductsQueryVariables = Exact<{
  input: GetProductInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type SimilarProductsQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, similarProducts: { __typename?: 'PaginatedProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, brand?: { __typename?: 'Brand', id: string, name: string } | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, category?: { __typename?: 'Category', id: string, name: string, parentId?: string | null } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> } }, me?: { __typename?: 'User', id: string } };

export type TrendingNowProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type TrendingNowProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', products: Array<{ __typename?: 'Product', id: string, title: string, status: ProductStatusEnum, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, category?: { __typename?: 'Category', id: string, name: string, parentId?: string | null } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> }, me?: { __typename?: 'User', id: string } };

export type ProductBottomSheetDeliveryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type ProductBottomSheetDeliveryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string } };

export type ProductBottomSheetPreviewPickupQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type ProductBottomSheetPreviewPickupQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string } };

export type ProductBottomSheetPreviewCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type ProductBottomSheetPreviewCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, parent?: { __typename?: 'Category', id: string, name: string } | null } };

export type ProductBottomSheetPreviewBrandQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ProductBottomSheetPreviewBrandQuery = { __typename?: 'Query', brand: { __typename?: 'Brand', id: string, type: BrandTypeEnum, name: string } };

export type ProductBottomSheetPreviewQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductBottomSheetPreviewQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, address?: string | null } };

export type PreviewProductUpsertQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type PreviewProductUpsertQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, co2Saving?: number | null } };

export type ProductBottomSheetProjectMyProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductBottomSheetProjectMyProjectsQuery = { __typename?: 'Query', myProjects: Array<{ __typename?: 'Project', id: string, title: string }> };

export type ProductBottomSheetProjectGetProjectQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type ProductBottomSheetProjectGetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type AnalyzeProductImageMutationVariables = Exact<{
  input: AnalyzeProductImageInput;
}>;


export type AnalyzeProductImageMutation = { __typename?: 'Mutation', analyzeProductImage: { __typename?: 'Product', id: string, title: string, description?: string | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, color?: string | null, colorType: ColorTypeEnum, condition: ProductConditionEnum, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } };

export type UpsertProductQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type UpsertProductQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, status: ProductStatusEnum, co2Saving?: number | null, minimumPrice: number, noProject?: boolean | null, address?: string | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null, project?: { __typename?: 'Project', id: string } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null }, me: { __typename?: 'User', id: string, sellerAccountIsEnabled: boolean } };

export type UpsertProductUpdateProductMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpsertProductUpdateProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', imagePutUrls: Array<string>, documentPutUrls: Array<string>, product: { __typename?: 'Product', id: string, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, status: ProductStatusEnum, co2Saving?: number | null, minimumPrice: number, noProject?: boolean | null, address?: string | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null, project?: { __typename?: 'Project', id: string } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } } };

export type ProductBottomSheetShippingQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductBottomSheetShippingQuery = { __typename?: 'Query', getAllShippingPrices: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }>, me: { __typename?: 'User', id: string, name?: string | null, address?: string | null, postCode?: string | null, phoneNumber?: string | null, city?: string | null } };

export type ShippingUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type ShippingUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, name?: string | null, address?: string | null, postCode?: string | null, phoneNumber?: string | null, city?: string | null } } };

export type OrganizationSettingUpdateMutationVariables = Exact<{
  input: UpdateOrganizationUserInput;
}>;


export type OrganizationSettingUpdateMutation = { __typename?: 'Mutation', updateOrganizationUser: { __typename?: 'User', id: string, username?: string | null, organizationNumber?: string | null, websiteUrl?: string | null } };

export type MyFavoritesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyFavoritesQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, likedProducts?: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, condition: ProductConditionEnum, likedByMe?: boolean | null, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null }, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }> } | null, likedProjects?: Array<{ __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, status: ProductStatusEnum, primaryImage?: { __typename?: 'File', id: string, url: string } | null }>, user: { __typename?: 'User', id: string, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }> | null } };

export type ConversationProductQueryVariables = Exact<{
  input: GetConversationInput;
  getProductInput: GetProductInput;
  latestPurchaseInput: LatestPurchaseInput;
}>;


export type ConversationProductQuery = { __typename?: 'Query', getConversation: Array<{ __typename?: 'Message', id: string, message: string, messageType: MessageTypeEnum, createdAt: any, images: Array<{ __typename?: 'File', id: string, url: string }>, documents: Array<{ __typename?: 'File', id: string, name?: string | null, url: string }>, sender: { __typename?: 'User', id: string, type: UserType, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }>, product: { __typename?: 'Product', id: string, title: string, price: number, status: ProductStatusEnum, seller: { __typename?: 'User', id: string, username?: string | null }, primaryImage?: { __typename?: 'File', id: string, url: string } | null }, latestPurchase?: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, paymentAcceptedAt?: any | null, shipmentBookedAt?: any | null, shipmentDeliveredAt?: any | null, deliveredAt?: any | null, failedAt?: any | null, approvedAt?: any | null, qrCodeUrl?: string | null, qrCodeContent?: string | null, isShipping: boolean, transportationMethod: TransportationEnum, sellerRespondedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, reviewerId: string, revieweeId: string }> } | null, me: { __typename?: 'User', id: string, username?: string | null, type: UserType } };

export type SearchQueryVariables = Exact<{
  isLoggedIn: Scalars['Boolean']['input'];
  searchResult: GetSearchResultsInput;
}>;


export type SearchQuery = { __typename?: 'Query', popularCategories: Array<{ __typename?: 'Category', id: string, name: string, parentId?: string | null, image?: { __typename?: 'File', id: string, url: string } | null }>, getSearchResults?: Array<{ __typename?: 'SearchResult', id: string, searchString: string, count: number }>, me?: { __typename?: 'User', id: string } };

export type DoSearchQueryVariables = Exact<{
  searchResultsInput: GetSimilarSearchResultsInput;
  usersInput: UsersInput;
}>;


export type DoSearchQuery = { __typename?: 'Query', getSimilarSearchResults: Array<{ __typename?: 'SearchResult', id: string, searchString: string, count: number }>, users: { __typename?: 'UsersResponse', users: Array<{ __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null }> } };

export type ClearSearchHistoryMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearSearchHistoryMutation = { __typename?: 'Mutation', clearSearchHistory: boolean };

export type CreateSearchResultMutationVariables = Exact<{
  input: CreateSearchResultInput;
}>;


export type CreateSearchResultMutation = { __typename?: 'Mutation', createSearchResult?: { __typename?: 'SearchResult', id: string, searchString: string, count: number } | null };

export type UpsertProductProductFragmentFragment = { __typename?: 'Product', id: string, title: string, description?: string | null, additionalInfo?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, heightUnit: MeasurementUnitEnum, width?: number | null, widthUnit: MeasurementUnitEnum, length?: number | null, lengthUnit: MeasurementUnitEnum, thickness?: number | null, thicknessUnit: MeasurementUnitEnum, diameter?: number | null, diameterUnit: MeasurementUnitEnum, weight?: number | null, weightUnit: MeasurementUnitEnum, color?: string | null, colorType: ColorTypeEnum, status: ProductStatusEnum, co2Saving?: number | null, minimumPrice: number, noProject?: boolean | null, address?: string | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null, project?: { __typename?: 'Project', id: string } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null };

export type ExactAndApproximatePlaceQueryVariables = Exact<{
  input: LocationInputType;
}>;


export type ExactAndApproximatePlaceQuery = { __typename?: 'Query', exactAndApproximatePlace: { __typename?: 'ExactAndApproximatePlaceResponse', exact: { __typename?: 'ExactPlaceResponse', lat: number, lng: number, address: string }, approximate: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type AccountSettingsUserFragmentFragment = { __typename?: 'User', id: string, type: UserType, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null, organizationNumber?: string | null, websiteUrl?: string | null };

export type AccountSettingsUserQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsUserQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null, organizationNumber?: string | null, websiteUrl?: string | null } };

export type AccountSettingsUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type AccountSettingsUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, type: UserType, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null, organizationNumber?: string | null, websiteUrl?: string | null } } };

export const ProductViewFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductViewFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"hasOngoingPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeOwnPurchases"},"value":{"kind":"BooleanValue","value":true}}]},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductViewFragmentFragment, unknown>;
export const SettingsUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<SettingsUserFragmentFragment, unknown>;
export const ProjectsListFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectsListFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectsListFragmentFragment, unknown>;
export const UpsertProductProductFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UpsertProductProductFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minimumPrice"}},{"kind":"Field","name":{"kind":"Name","value":"noProject"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]} as unknown as DocumentNode<UpsertProductProductFragmentFragment, unknown>;
export const AccountSettingsUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}}]} as unknown as DocumentNode<AccountSettingsUserFragmentFragment, unknown>;
export const GetNewTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetNewTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNewTokensInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNewTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<GetNewTokensMutation, GetNewTokensMutationVariables>;
export const GetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchString"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"searchString"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchString"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}}]}}]}}]} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;
export const MapPinsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MapPins"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductMapPinsBoxLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productMapPinsInBoundingBox"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"pins"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prices"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"productIds"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MapPinsQuery, MapPinsQueryVariables>;
export const MapProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MapProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"sellerId"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortText"}},{"kind":"Field","name":{"kind":"Name","value":"showDetailsOnMap"}}]}}]}}]}}]} as unknown as DocumentNode<MapProductQuery, MapProductQueryVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}}}]},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const ProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Profile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviewed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"review"}},{"kind":"Field","name":{"kind":"Name","value":"stars"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyerId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCO2Savings"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ProfileQuery, ProfileQueryVariables>;
export const ProfileProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProfileProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<ProfileProductsQuery, ProfileProductsQueryVariables>;
export const ProfileUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProfileUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicturePutUrl"}}]}}]}}]} as unknown as DocumentNode<ProfileUpdateUserMutation, ProfileUpdateUserMutationVariables>;
export const RootCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RootCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategoriesQuery, RootCategoriesQueryVariables>;
export const SubCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SubCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SubCategoriesQuery, SubCategoriesQueryVariables>;
export const UseCreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UseCreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganizationUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}}]}}]}}]} as unknown as DocumentNode<UseCreateOrganizationMutation, UseCreateOrganizationMutationVariables>;
export const ProjectLikeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProjectLike"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLikeProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLikeProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}}]}}]}}]} as unknown as DocumentNode<ProjectLikeMutation, ProjectLikeMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LogoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const LocationSearchQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationSearchQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]}}]} as unknown as DocumentNode<LocationSearchQueryQuery, LocationSearchQueryQueryVariables>;
export const AddressToLocationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddressToLocationQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressToLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addressToLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]} as unknown as DocumentNode<AddressToLocationQueryQuery, AddressToLocationQueryQueryVariables>;
export const LocationToAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationToAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationToAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<LocationToAddressQuery, LocationToAddressQueryVariables>;
export const ProductViewLikeProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProductViewLikeProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLikeProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLikeProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}}]}}]}}]} as unknown as DocumentNode<ProductViewLikeProductMutation, ProductViewLikeProductMutationVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const SummaryCreateFreePurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SummaryCreateFreePurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PurchaseProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<SummaryCreateFreePurchaseMutation, SummaryCreateFreePurchaseMutationVariables>;
export const ProductRemoveProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProductRemoveProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductViewFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductViewFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"hasOngoingPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeOwnPurchases"},"value":{"kind":"BooleanValue","value":true}}]},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductRemoveProductMutation, ProductRemoveProductMutationVariables>;
export const CreateMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"messageType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"imagePutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"documentPutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateMessageMutation, CreateMessageMutationVariables>;
export const MarkConversationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkConversationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkAsReadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markConversationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkConversationAsReadMutation, MarkConversationAsReadMutationVariables>;
export const OnboardSellerAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OnboardSellerAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onboardSellerAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"clientSecret"}},{"kind":"Field","name":{"kind":"Name","value":"fields"}}]}}]}}]} as unknown as DocumentNode<OnboardSellerAccountMutation, OnboardSellerAccountMutationVariables>;
export const TabLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TabLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUnreadConversationsCount"}}]}}]} as unknown as DocumentNode<TabLayoutQuery, TabLayoutQueryVariables>;
export const NewPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NewPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<NewPasswordMutation, NewPasswordMutationVariables>;
export const AppQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<AppQueryQuery, AppQueryQueryVariables>;
export const GetProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetProductQuery, GetProductQueryVariables>;
export const GetArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"article"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"articleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]} as unknown as DocumentNode<GetArticleQuery, GetArticleQueryVariables>;
export const HubsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Hubs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<HubsQuery, HubsQueryVariables>;
export const PartnersPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PartnersPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partners"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageContentByPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"heroHtml"}}]}}]}}]} as unknown as DocumentNode<PartnersPageQuery, PartnersPageQueryVariables>;
export const HubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Hub"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<HubQuery, HubQueryVariables>;
export const ProductViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductViewFragment"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductViewFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"hasOngoingPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeOwnPurchases"},"value":{"kind":"BooleanValue","value":true}}]},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductViewQuery, ProductViewQueryVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const GetProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectsListFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectsListFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getConversations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"messageType"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetConversationsQuery, GetConversationsQueryVariables>;
export const GetFavoriteProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFavoriteProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectsListFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectsListFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<GetFavoriteProjectsQuery, GetFavoriteProjectsQueryVariables>;
export const AccountPurchasesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountPurchases"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MyPurchasesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myPurchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentAcceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resolution"}}]}}]}}]}}]} as unknown as DocumentNode<AccountPurchasesQuery, AccountPurchasesQueryVariables>;
export const PurchasesPurchaseReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PurchasesPurchaseReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PurchasesPurchaseReceiptQuery, PurchasesPurchaseReceiptQueryVariables>;
export const SalesPurchaseReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesPurchaseReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<SalesPurchaseReceiptQuery, SalesPurchaseReceiptQueryVariables>;
export const SettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SettingsUserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"sellerAccountIsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"organizationAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SettingsUserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organizationOwner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SettingsUserFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const SwitchAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SettingsUserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<SwitchAccountMutation, SwitchAccountMutationVariables>;
export const AccountSalesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSales"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MyPurchasesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myPurchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentAcceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"buyer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resolution"}}]}}]}}]}}]} as unknown as DocumentNode<AccountSalesQuery, AccountSalesQueryVariables>;
export const ShippingCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShippingCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeContent"}}]}}]}}]} as unknown as DocumentNode<ShippingCodeQuery, ShippingCodeQueryVariables>;
export const ConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"conversations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ConversationsQuery, ConversationsQueryVariables>;
export const BuyProductInitialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuyProductInitial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}}]} as unknown as DocumentNode<BuyProductInitialQuery, BuyProductInitialQueryVariables>;
export const BuyProductTransportationOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuyProductTransportationOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTransportationOptionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPickupOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getShippingOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"servicePoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getDeliveryOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isWithinRadius"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromProduct"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}}]}}]}}]} as unknown as DocumentNode<BuyProductTransportationOptionsQuery, BuyProductTransportationOptionsQueryVariables>;
export const PurchaseSuccessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PurchaseSuccess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"boughtForFree"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<PurchaseSuccessQuery, PurchaseSuccessQueryVariables>;
export const BuyProductPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuyProductPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<BuyProductPaymentQuery, BuyProductPaymentQueryVariables>;
export const BuyProductCreatePurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BuyProductCreatePurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PurchaseProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference"}}]}}]}}]} as unknown as DocumentNode<BuyProductCreatePurchaseMutation, BuyProductCreatePurchaseMutationVariables>;
export const PaymentCancelPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PaymentCancelPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancelPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PaymentCancelPurchaseMutation, PaymentCancelPurchaseMutationVariables>;
export const SearchInSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchInSeason"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}}]}}]}}]} as unknown as DocumentNode<SearchInSeasonQuery, SearchInSeasonQueryVariables>;
export const PollStripeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PollStripe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PollStripeQuery, PollStripeQueryVariables>;
export const DeleteAccountMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DeleteAccountMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMeQuery, DeleteAccountMeQueryVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const AccountSettingsNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnMessage"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnPurchaseUpdate"}}]}}]}}]} as unknown as DocumentNode<AccountSettingsNotificationsQuery, AccountSettingsNotificationsQueryVariables>;
export const AccountSettingsUpdateNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountSettingsUpdateNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnMessage"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnPurchaseUpdate"}}]}}]}}]}}]} as unknown as DocumentNode<AccountSettingsUpdateNotificationsMutation, AccountSettingsUpdateNotificationsMutationVariables>;
export const AccountSettingsLayoutPayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsLayoutPayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<AccountSettingsLayoutPayoutQuery, AccountSettingsLayoutPayoutQueryVariables>;
export const AddBankPayoutAccountMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddBankPayoutAccountMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AddBankPayoutAccountMeQuery, AddBankPayoutAccountMeQueryVariables>;
export const AddBankPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddBankPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddBankPayoutAccountMutation, AddBankPayoutAccountMutationVariables>;
export const AccountSettingsPayoutQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsPayoutQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"payoutAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"routingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}}]}}]}}]}}]} as unknown as DocumentNode<AccountSettingsPayoutQueryQuery, AccountSettingsPayoutQueryQueryVariables>;
export const MyAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<MyAccountQuery, MyAccountQueryVariables>;
export const AdRowSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdRowSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"distanceFrom"}}}]},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AdRowSectionQuery, AdRowSectionQueryVariables>;
export const BuyProductDeliveryOptionCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuyProductDeliveryOptionCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTransportationOptionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDeliveryOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deliverToLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isWithinRadius"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromProduct"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}}]}}]} as unknown as DocumentNode<BuyProductDeliveryOptionCardQuery, BuyProductDeliveryOptionCardQueryVariables>;
export const BuyProductDeliveryOptionSingleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuyProductDeliveryOptionSingle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTransportationOptionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDeliveryOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deliverToLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isWithinRadius"}},{"kind":"Field","name":{"kind":"Name","value":"distanceFromProduct"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}}]}}]} as unknown as DocumentNode<BuyProductDeliveryOptionSingleQuery, BuyProductDeliveryOptionSingleQueryVariables>;
export const ShippingDetailsUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShippingDetailsUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}}]}}]} as unknown as DocumentNode<ShippingDetailsUpdateUserMutation, ShippingDetailsUpdateUserMutationVariables>;
export const SinglePickupOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SinglePickupOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"optionInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTransportationOptionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getPickupOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"optionInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<SinglePickupOptionQuery, SinglePickupOptionQueryVariables>;
export const BuySingleShippingOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BuySingleShippingOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTransportationOptionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getShippingOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"servicePoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}}]}}]} as unknown as DocumentNode<BuySingleShippingOptionQuery, BuySingleShippingOptionQueryVariables>;
export const ComingSoonSignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ComingSoonSignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signupNewsLetter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ComingSoonSignUpMutation, ComingSoonSignUpMutationVariables>;
export const ConversationAcceptPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConversationAcceptPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}}]}}]}}]} as unknown as DocumentNode<ConversationAcceptPurchaseMutation, ConversationAcceptPurchaseMutationVariables>;
export const ConversationMarkAsDeliveredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConversationMarkAsDelivered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkPurchaseAsDeliveredInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPurchaseAsDelivered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}}]}}]}}]} as unknown as DocumentNode<ConversationMarkAsDeliveredMutation, ConversationMarkAsDeliveredMutationVariables>;
export const ForTheSeasonCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ForTheSeasonCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<ForTheSeasonCategoriesQuery, ForTheSeasonCategoriesQueryVariables>;
export const BrandFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandFilter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<BrandFilterQuery, BrandFilterQueryVariables>;
export const CategoryFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryFilter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CategoryFilterQuery, CategoryFilterQueryVariables>;
export const RootCategoryFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategoryFilter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategoryFilterQuery, RootCategoryFilterQueryVariables>;
export const PriceFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PriceFilter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProductPriceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}}]}}]} as unknown as DocumentNode<PriceFilterQuery, PriceFilterQueryVariables>;
export const HamburgerMenuDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HamburgerMenu"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"inSelection"}},{"kind":"Field","name":{"kind":"Name","value":"inSeason"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<HamburgerMenuQuery, HamburgerMenuQueryVariables>;
export const DetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DetailsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<DetailsQueryQuery, DetailsQueryQueryVariables>;
export const UpdateDetailsFieldsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDetailsFields"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FinalizeUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<UpdateDetailsFieldsMutation, UpdateDetailsFieldsMutationVariables>;
export const DetailsValidUsernameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DetailsValidUsername"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usernameIsValid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}]}]}}]} as unknown as DocumentNode<DetailsValidUsernameQuery, DetailsValidUsernameQueryVariables>;
export const CreateBusinessQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateBusinessQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessQueryQuery, CreateBusinessQueryQueryVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationMailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerificationMail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ResendVerificationMailMutation, ResendVerificationMailMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UserExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserExistsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<UserExistsQuery, UserExistsQueryVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const ListFooterSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListFooterSection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listFooterSection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"articleId"}},{"kind":"Field","name":{"kind":"Name","value":"footerSectionId"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"article"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ListFooterSectionQuery, ListFooterSectionQueryVariables>;
export const PayoutCheckSellerAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayoutCheckSellerAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sellerAccountIsEnabled"}}]}}]}}]} as unknown as DocumentNode<PayoutCheckSellerAccountQuery, PayoutCheckSellerAccountQueryVariables>;
export const CategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionQuery, CategorySectionQueryVariables>;
export const CategorySectionSelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySectionSelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionSelectedCategoryQuery, CategorySectionSelectedCategoryQueryVariables>;
export const BrandSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<BrandSectionQuery, BrandSectionQueryVariables>;
export const BrandSectionSearchBrandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandSectionSearchBrand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BrandsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<BrandSectionSearchBrandQuery, BrandSectionSearchBrandQueryVariables>;
export const CreateBrandByUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBrandByUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBrandByUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBrandByUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<CreateBrandByUserMutation, CreateBrandByUserMutationVariables>;
export const MeasurementsSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeasurementsSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"measurements"}}]}}]}}]} as unknown as DocumentNode<MeasurementsSectionQuery, MeasurementsSectionQueryVariables>;
export const RecommendedQuantitiesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedQuantitiesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantityUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantityUnit"}}]}}]}}]} as unknown as DocumentNode<RecommendedQuantitiesQueryQuery, RecommendedQuantitiesQueryQueryVariables>;
export const RootCategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]} as unknown as DocumentNode<RootCategorySectionQuery, RootCategorySectionQueryVariables>;
export const RootCategorySelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategorySelectedCategoryQuery, RootCategorySelectedCategoryQueryVariables>;
export const EditProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EditProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortText"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"showDetailsOnMap"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<EditProjectQueryQuery, EditProjectQueryQueryVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortText"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"showDetailsOnMap"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const CreateProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateProjectQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectQueryQuery, CreateProjectQueryQueryVariables>;
export const CreateProjectMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortText"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutationMutation, CreateProjectMutationMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const PreviewProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}}]}}]}}]} as unknown as DocumentNode<PreviewProjectQueryQuery, PreviewProjectQueryQueryVariables>;
export const AbortPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AbortPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AbortPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"abortPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"abortedById"}},{"kind":"Field","name":{"kind":"Name","value":"isRefunded"}}]}}]}}]} as unknown as DocumentNode<AbortPurchaseMutation, AbortPurchaseMutationVariables>;
export const PurchaseReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PurchaseReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentAcceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentDroppedOffAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentDeliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"pausedAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"isFree"}},{"kind":"Field","name":{"kind":"Name","value":"isRefunded"}},{"kind":"Field","name":{"kind":"Name","value":"abortedById"}},{"kind":"Field","name":{"kind":"Name","value":"boughtForFree"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeContent"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"buyer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviewerId"}},{"kind":"Field","name":{"kind":"Name","value":"revieweeId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resolution"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<PurchaseReceiptQuery, PurchaseReceiptQueryVariables>;
export const ApprovePurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApprovePurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ApprovePurchaseMutation, ApprovePurchaseMutationVariables>;
export const ReceiptMarkAsDeliveredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReceiptMarkAsDelivered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkPurchaseAsDeliveredInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPurchaseAsDelivered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}}]}}]}}]} as unknown as DocumentNode<ReceiptMarkAsDeliveredMutation, ReceiptMarkAsDeliveredMutationVariables>;
export const RecommendedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecommendedProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recommendedProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RecommendedProductsQuery, RecommendedProductsQueryVariables>;
export const ReportPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReportPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyerId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ReportPurchaseQuery, ReportPurchaseQueryVariables>;
export const CreateReportPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReportPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReportPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReportPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateReportPurchaseMutation, CreateReportPurchaseMutationVariables>;
export const ReportProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReportProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reporterId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ReportProductQuery, ReportProductQueryVariables>;
export const CreateReportProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReportProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReportProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReportProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reporterId"}}]}}]}}]} as unknown as DocumentNode<CreateReportProductMutation, CreateReportProductMutationVariables>;
export const CreateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyerId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sellerId"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateReviewQuery, CreateReviewQueryVariables>;
export const CreateReviewCreateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReviewCreateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stars"}},{"kind":"Field","name":{"kind":"Name","value":"review"}}]}}]}}]} as unknown as DocumentNode<CreateReviewCreateReviewMutation, CreateReviewCreateReviewMutationVariables>;
export const SellProductDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDraft"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SellProductDeleteMutation, SellProductDeleteMutationVariables>;
export const SellProductQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SellProductQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrCreateDraftProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SellProductQueryQuery, SellProductQueryQueryVariables>;
export const SimilarProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SimilarProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"similarProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SimilarProductsQuery, SimilarProductsQueryVariables>;
export const TrendingNowProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrendingNowProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrendingNowProductsQuery, TrendingNowProductsQueryVariables>;
export const ProductBottomSheetDeliveryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetDelivery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetDeliveryQuery, ProductBottomSheetDeliveryQueryVariables>;
export const ProductBottomSheetPreviewPickupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetPreviewPickup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetPreviewPickupQuery, ProductBottomSheetPreviewPickupQueryVariables>;
export const ProductBottomSheetPreviewCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetPreviewCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetPreviewCategoryQuery, ProductBottomSheetPreviewCategoryQueryVariables>;
export const ProductBottomSheetPreviewBrandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetPreviewBrand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetPreviewBrandQuery, ProductBottomSheetPreviewBrandQueryVariables>;
export const ProductBottomSheetPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetPreview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetPreviewQuery, ProductBottomSheetPreviewQueryVariables>;
export const PreviewProductUpsertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewProductUpsert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}}]}}]}}]} as unknown as DocumentNode<PreviewProductUpsertQuery, PreviewProductUpsertQueryVariables>;
export const ProductBottomSheetProjectMyProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetProjectMyProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetProjectMyProjectsQuery, ProductBottomSheetProjectMyProjectsQueryVariables>;
export const ProductBottomSheetProjectGetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetProjectGetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetProjectGetProjectQuery, ProductBottomSheetProjectGetProjectQueryVariables>;
export const AnalyzeProductImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AnalyzeProductImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnalyzeProductImageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"analyzeProductImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<AnalyzeProductImageMutation, AnalyzeProductImageMutationVariables>;
export const UpsertProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UpsertProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UpsertProductProductFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sellerAccountIsEnabled"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UpsertProductProductFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minimumPrice"}},{"kind":"Field","name":{"kind":"Name","value":"noProject"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]} as unknown as DocumentNode<UpsertProductQuery, UpsertProductQueryVariables>;
export const UpsertProductUpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertProductUpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UpsertProductProductFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imagePutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"documentPutUrls"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UpsertProductProductFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"additionalInfo"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"heightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"widthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"lengthUnit"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"thicknessUnit"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"diameterUnit"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"weightUnit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"colorType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"co2Saving"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minimumPrice"}},{"kind":"Field","name":{"kind":"Name","value":"noProject"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]} as unknown as DocumentNode<UpsertProductUpdateProductMutation, UpsertProductUpdateProductMutationVariables>;
export const ProductBottomSheetShippingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBottomSheetShipping"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllShippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}}]} as unknown as DocumentNode<ProductBottomSheetShippingQuery, ProductBottomSheetShippingQueryVariables>;
export const ShippingUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShippingUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]}}]}}]} as unknown as DocumentNode<ShippingUpdateUserMutation, ShippingUpdateUserMutationVariables>;
export const OrganizationSettingUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrganizationSettingUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganizationUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganizationUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}}]}}]} as unknown as DocumentNode<OrganizationSettingUpdateMutation, OrganizationSettingUpdateMutationVariables>;
export const MyFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyFavoritesQuery, MyFavoritesQueryVariables>;
export const ConversationProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConversationProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"getProductInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latestPurchaseInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LatestPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"messageType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"getProductInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latestPurchaseInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentAcceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentBookedAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentDeliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeContent"}},{"kind":"Field","name":{"kind":"Name","value":"isShipping"}},{"kind":"Field","name":{"kind":"Name","value":"transportationMethod"}},{"kind":"Field","name":{"kind":"Name","value":"sellerRespondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviewerId"}},{"kind":"Field","name":{"kind":"Name","value":"revieweeId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<ConversationProductQuery, ConversationProductQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSearchResultsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"popularCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const DoSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DoSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSimilarSearchResultsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSimilarSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DoSearchQuery, DoSearchQueryVariables>;
export const ClearSearchHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearSearchHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearSearchHistory"}}]}}]} as unknown as DocumentNode<ClearSearchHistoryMutation, ClearSearchHistoryMutationVariables>;
export const CreateSearchResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSearchResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSearchResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSearchResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<CreateSearchResultMutation, CreateSearchResultMutationVariables>;
export const ExactAndApproximatePlaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExactAndApproximatePlace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exactAndApproximatePlace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<ExactAndApproximatePlaceQuery, ExactAndApproximatePlaceQueryVariables>;
export const AccountSettingsUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountSettingsUserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}}]} as unknown as DocumentNode<AccountSettingsUserQuery, AccountSettingsUserQueryVariables>;
export const AccountSettingsUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountSettingsUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountSettingsUserFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}}]} as unknown as DocumentNode<AccountSettingsUpdateUserMutation, AccountSettingsUpdateUserMutationVariables>;