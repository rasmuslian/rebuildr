/* eslint-disable */
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

export type AbortPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type AcceptPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type AddressToLocationInput = {
  address: Scalars['String']['input'];
};

export type AnalyzeProductImagesInput = {
  productId: Scalars['String']['input'];
};

export type ApproximatePlaceResponse = {
  __typename?: 'ApproximatePlaceResponse';
  address: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type Article = {
  __typename?: 'Article';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Banner = {
  __typename?: 'Banner';
  action?: Maybe<BannerActionEnum>;
  backgroundImage?: Maybe<File>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  presetBackground: BannerPresetBackground;
  showFrom: Scalars['DateTime']['output'];
  showTo?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export enum BannerActionEnum {
  Sell = 'SELL'
}

export enum BannerPresetBackground {
  Metallic = 'METALLIC',
  Rebuildr = 'REBUILDR',
  Wood = 'WOOD'
}

export type Brand = {
  __typename?: 'Brand';
  canDelete: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  type: BrandTypeEnum;
  updatedAt: Scalars['DateTime']['output'];
};

export enum BrandTypeEnum {
  Other = 'OTHER',
  Regular = 'REGULAR'
}

export type BrandsInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Co2Factor = {
  __typename?: 'CO2Factor';
  categoryName: Scalars['String']['output'];
  disposalCoefficient: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  productName: Scalars['String']['output'];
  productionCoefficient: Scalars['Float']['output'];
};

export enum CanAbortDeniedReasonEnum {
  Handoff = 'HANDOFF',
  Shipping = 'SHIPPING'
}

export type CanAbortResponse = {
  __typename?: 'CanAbortResponse';
  deniedReason: CanAbortDeniedReasonEnum;
};

export type CancelPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CategoriesInput = {
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
  trending?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Category = {
  __typename?: 'Category';
  ancestorIds: Array<Scalars['String']['output']>;
  brands: Array<Brand>;
  children: Array<Category>;
  co2Factor?: Maybe<Co2Factor>;
  description: Scalars['String']['output'];
  hasChildren: Scalars['Boolean']['output'];
  icon?: Maybe<CategoryIconEnum>;
  id: Scalars['ID']['output'];
  image?: Maybe<File>;
  inSeason: Scalars['Boolean']['output'];
  inSelection: Scalars['Boolean']['output'];
  measurements: Array<MeasurementTypeEnum>;
  name: Scalars['String']['output'];
  orderIndex: Scalars['Int']['output'];
  parent?: Maybe<Category>;
  parentId?: Maybe<Scalars['String']['output']>;
  primaryQuantityUnit?: Maybe<QuantityUnitEnum>;
  secondaryQuantityUnit?: Maybe<QuantityUnitEnum>;
};

export enum CategoryIconEnum {
  Door = 'DOOR',
  Electrical = 'ELECTRICAL',
  Fasteners = 'FASTENERS',
  Floor = 'FLOOR',
  Interior = 'INTERIOR',
  KitchenBathroom = 'KITCHEN_BATHROOM',
  Material = 'MATERIAL',
  Outdoors = 'OUTDOORS',
  Paint = 'PAINT',
  Roof = 'ROOF',
  Tiles = 'TILES',
  Tools = 'TOOLS',
  Window = 'WINDOW',
  Wood = 'WOOD',
  Workplace = 'WORKPLACE'
}

export type CategoryInput = {
  id: Scalars['String']['input'];
};

export enum ChatActionEnum {
  Abort = 'ABORT',
  Aboutabort = 'ABOUTABORT',
  Aboutpayout = 'ABOUTPAYOUT',
  Aboutreview = 'ABOUTREVIEW',
  Report = 'REPORT'
}

export type CmsBrandIdInput = {
  id: Scalars['String']['input'];
};

export type CmsCreateArticleInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CmsCreateBannerInput = {
  action?: InputMaybe<BannerActionEnum>;
  backgroundImage?: InputMaybe<FileInputType>;
  label: Scalars['String']['input'];
  presetBackground?: InputMaybe<BannerPresetBackground>;
  showFrom: Scalars['DateTime']['input'];
  showTo?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CmsCreateBannerResponse = {
  __typename?: 'CmsCreateBannerResponse';
  banner: Banner;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type CmsCreateBrandInput = {
  name: Scalars['String']['input'];
};

export type CmsCreateCategoryInput = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  co2FactorId?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  image?: InputMaybe<FileInputType>;
  inSeason: Scalars['Boolean']['input'];
  inSelection: Scalars['Boolean']['input'];
  measurements: Array<MeasurementTypeEnum>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type CmsCreateCategoryResponse = {
  __typename?: 'CmsCreateCategoryResponse';
  category: Category;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type CmsCreateFilesInput = {
  files?: InputMaybe<Array<FileInputType>>;
};

export type CmsCreateFilesResponse = {
  __typename?: 'CmsCreateFilesResponse';
  presignedPutUrls: Array<Scalars['String']['output']>;
};

export type CmsCreateFooterSectionInput = {
  entries: Array<FooterEntryInput>;
  orderIndex: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CmsCreatePartnerInput = {
  description: Scalars['String']['input'];
  logo: FileInputType;
  name: Scalars['String']['input'];
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsCreatePartnerResponse = {
  __typename?: 'CmsCreatePartnerResponse';
  imagePutUrl?: Maybe<Scalars['String']['output']>;
  partner: Partner;
};

export type CmsCreateProductInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  brandId: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  condition: ProductConditionEnum;
  deliveryEnabled: Scalars['Boolean']['input'];
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  description: Scalars['String']['input'];
  documents: Array<FileInputType>;
  images: Array<FileInputType>;
  isGiveaway: Scalars['Boolean']['input'];
  measurement?: InputMaybe<MeasurementInput>;
  noProject: Scalars['Boolean']['input'];
  pickupEnabled: Scalars['Boolean']['input'];
  price: Scalars['Float']['input'];
  primaryQuantity: Scalars['Float']['input'];
  primaryUnit: QuantityUnitEnum;
  projectId?: InputMaybe<Scalars['String']['input']>;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  sellerId?: InputMaybe<Scalars['String']['input']>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
  soldByQuantity?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type CmsCreateProductResponse = {
  __typename?: 'CmsCreateProductResponse';
  documentPutUrls: Array<Scalars['String']['output']>;
  imagePutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type CmsCreateProjectInput = {
  address: Scalars['String']['input'];
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  shortText?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type CmsDeletePartnerInput = {
  id: Scalars['String']['input'];
};

export type CmsListFilesInput = {
  fileType: FileType;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type CmsListFilesResponse = {
  __typename?: 'CmsListFilesResponse';
  files: Array<File>;
  total: Scalars['Int']['output'];
};

export type CmsListProductsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type CmsListProductsResponse = {
  __typename?: 'CmsListProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export type CmsListProjectsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type CmsListProjectsResponse = {
  __typename?: 'CmsListProjectsResponse';
  projects: Array<Project>;
  total: Scalars['Int']['output'];
};

export type CmsListPurchasesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PurchaseStatusEnum>;
};

export type CmsListPurchasesResponse = {
  __typename?: 'CmsListPurchasesResponse';
  purchases: Array<Purchase>;
  total: Scalars['Int']['output'];
};

export type CmsListUsersInput = {
  canSell?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type CmsListUsersResponse = {
  __typename?: 'CmsListUsersResponse';
  total: Scalars['Int']['output'];
  users: Array<User>;
};

export type CmsPreviewSystemMessageInput = {
  decision?: InputMaybe<Scalars['String']['input']>;
  firstSale?: InputMaybe<Scalars['Boolean']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  provider?: InputMaybe<ShippingProviderEnum>;
  role: SystemMessageRoleEnum;
  step: SystemMessageStepEnum;
  transportation?: InputMaybe<TransportationEnum>;
};

export type CmsProductStatisticsDataPoint = {
  __typename?: 'CmsProductStatisticsDataPoint';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

export enum CmsProductStatisticsGroupByEnum {
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK'
}

export type CmsProductStatisticsInput = {
  groupBy?: InputMaybe<CmsProductStatisticsGroupByEnum>;
};

export type CmsProductStatisticsResponse = {
  __typename?: 'CmsProductStatisticsResponse';
  data: Array<CmsProductStatisticsDataPoint>;
};

export type CmsPurchaseStatisticsDataPoint = {
  __typename?: 'CmsPurchaseStatisticsDataPoint';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

export type CmsPurchaseStatisticsInput = {
  groupBy?: InputMaybe<CmsProductStatisticsGroupByEnum>;
};

export type CmsPurchaseStatisticsResponse = {
  __typename?: 'CmsPurchaseStatisticsResponse';
  data: Array<CmsPurchaseStatisticsDataPoint>;
};

export type CmsReassignBrandInput = {
  fromBrandId: Scalars['String']['input'];
  toBrandId: Scalars['String']['input'];
};

export type CmsReassignBrandResponse = {
  __typename?: 'CmsReassignBrandResponse';
  fromBrand: Brand;
  toBrand: Brand;
};

export type CmsRefundPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CmsResolveReportPurchaseInput = {
  reportPurchaseId: Scalars['String']['input'];
  resolution: ReportPurchaseResolutionEnum;
};

export type CmsTestTemplateInput = {
  template: Scalars['String']['input'];
};

export type CmsUpdateArticleInput = {
  body: Scalars['String']['input'];
  id: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CmsUpdateBannerInput = {
  action?: InputMaybe<BannerActionEnum>;
  backgroundImage?: InputMaybe<FileInputType>;
  id: Scalars['String']['input'];
  label: Scalars['String']['input'];
  presetBackground?: InputMaybe<BannerPresetBackground>;
  showFrom: Scalars['DateTime']['input'];
  showTo?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUpdateBrandInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CmsUpdateCo2Factor = {
  disposalCoefficient?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
};

export type CmsUpdateCategoriesInput = {
  updateInputs: Array<CmsUpdateCategoryOrderInput>;
};

export type CmsUpdateCategoryInput = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  co2FactorId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  image?: InputMaybe<FileInputType>;
  inSeason?: InputMaybe<Scalars['Boolean']['input']>;
  inSelection?: InputMaybe<Scalars['Boolean']['input']>;
  measurements?: InputMaybe<Array<MeasurementTypeEnum>>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUpdateCategoryOrderInput = {
  id: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
};

export type CmsUpdateCategoryResponse = {
  __typename?: 'CmsUpdateCategoryResponse';
  category: Category;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type CmsUpdateFooterSectionInput = {
  entries: Array<FooterEntryInput>;
  id: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CmsUpdatePartnerInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  logo?: InputMaybe<FileInputType>;
  name?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUpdateProductInput = {
  addDocuments?: InputMaybe<Array<FileInputType>>;
  addImages?: InputMaybe<Array<FileInputType>>;
  address?: InputMaybe<Scalars['String']['input']>;
  brandId: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  condition: ProductConditionEnum;
  deliveryEnabled: Scalars['Boolean']['input'];
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  isGiveaway: Scalars['Boolean']['input'];
  measurement?: InputMaybe<MeasurementInput>;
  noProject: Scalars['Boolean']['input'];
  pickupEnabled: Scalars['Boolean']['input'];
  price: Scalars['Float']['input'];
  primaryQuantity: Scalars['Float']['input'];
  primaryUnit: QuantityUnitEnum;
  projectId?: InputMaybe<Scalars['String']['input']>;
  removeDocuments?: InputMaybe<Array<Scalars['String']['input']>>;
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
  soldByQuantity?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type CmsUpdateProductResponse = {
  __typename?: 'CmsUpdateProductResponse';
  documentPutUrls: Array<Scalars['String']['output']>;
  imagePutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type CmsUpdateProjectInput = {
  address: Scalars['String']['input'];
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  shortText?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type CmsUpdateUsersInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  role: UserRoleEnum;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CmsUserStatisticsDataPoint = {
  __typename?: 'CmsUserStatisticsDataPoint';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

export type CmsUserStatisticsInput = {
  groupBy?: InputMaybe<CmsProductStatisticsGroupByEnum>;
};

export type CmsUserStatisticsResponse = {
  __typename?: 'CmsUserStatisticsResponse';
  data: Array<CmsUserStatisticsDataPoint>;
};

export enum ColorTypeEnum {
  FreeText = 'FREE_TEXT',
  Ncs = 'NCS'
}

export type Conversation = {
  __typename?: 'Conversation';
  buyer: User;
  buyerId: Scalars['ID']['output'];
  buyerReadAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<Message>;
  messages: Array<Message>;
  product: Product;
  productId: Scalars['String']['output'];
  purchase?: Maybe<Purchase>;
  purchaseId?: Maybe<Scalars['String']['output']>;
  sellerReadAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CreateBrandByUserInput = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateMessageInput = {
  conversationId?: InputMaybe<Scalars['String']['input']>;
  documents?: InputMaybe<Array<FileInputType>>;
  images?: InputMaybe<Array<FileInputType>>;
  message: Scalars['String']['input'];
  productId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrganizationUserInput = {
  organizationName: Scalars['String']['input'];
  organizationNumber: Scalars['String']['input'];
};

export type CreateProductInput = {
  address: Scalars['String']['input'];
  amount?: InputMaybe<Scalars['Float']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  categoryId: Scalars['String']['input'];
  condition: ProductConditionEnum;
  depth?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  images?: InputMaybe<Array<FileInputType>>;
  isGiveaway?: InputMaybe<Scalars['Boolean']['input']>;
  price: Scalars['Float']['input'];
  title: Scalars['String']['input'];
  volume?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateProductResponse = {
  __typename?: 'CreateProductResponse';
  presignedPutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type CreateProjectInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  location: LocationInputType;
  shortText?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateReportProductInput = {
  message: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  type: ReportProductTypeEnum;
};

export type CreateReportPurchaseInput = {
  message: Scalars['String']['input'];
  purchaseId: Scalars['String']['input'];
  type: ReportPurchaseTypeEnum;
};

export type CreateReviewInput = {
  purchaseId: Scalars['String']['input'];
  review: Scalars['String']['input'];
  stars: Scalars['Int']['input'];
};

export type CreateSearchResultInput = {
  searchString: Scalars['String']['input'];
};

export type DeleteProjectInput = {
  id: Scalars['String']['input'];
};

export type DeliveryOptionResponse = {
  __typename?: 'DeliveryOptionResponse';
  deliverToLocation: LocationResponse;
  deliveryPrice: Scalars['Float']['output'];
  distanceFromProduct: Scalars['Float']['output'];
  isWithinRadius: Scalars['Boolean']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
};

export type ExactAndApproximatePlaceResponse = {
  __typename?: 'ExactAndApproximatePlaceResponse';
  approximate: ApproximatePlaceResponse;
  exact: ExactPlaceResponse;
};

export type ExactPlaceResponse = {
  __typename?: 'ExactPlaceResponse';
  address: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type File = {
  __typename?: 'File';
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type FileInputType = {
  mimeType: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum FileType {
  Document = 'DOCUMENT',
  Image = 'IMAGE'
}

export type FinalizeUserInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type FooterEntryInput = {
  articleId?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  orderIndex: Scalars['Int']['input'];
  type: FooterSectionEntryType;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type FooterSection = {
  __typename?: 'FooterSection';
  entries: Array<FooterSectionEntry>;
  id: Scalars['ID']['output'];
  orderIndex: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export type FooterSectionEntry = {
  __typename?: 'FooterSectionEntry';
  article?: Maybe<Article>;
  articleId?: Maybe<Scalars['String']['output']>;
  footerSectionId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  orderIndex: Scalars['Float']['output'];
  type: FooterSectionEntryType;
  url?: Maybe<Scalars['String']['output']>;
};

export enum FooterSectionEntryType {
  Article = 'ARTICLE',
  Link = 'LINK'
}

export type GetAddressInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type GetAddressResponse = {
  __typename?: 'GetAddressResponse';
  address: Scalars['String']['output'];
};

export type GetCategoriesInput = {
  parentIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GetConversationInput = {
  id: Scalars['String']['input'];
};

export type GetConversationsInput = {
  productId?: InputMaybe<Scalars['String']['input']>;
  type: GetConversationsType;
};

export enum GetConversationsType {
  Buying = 'BUYING',
  BuyingAndSelling = 'BUYING_AND_SELLING',
  Selling = 'SELLING'
}

export type GetNewTokensInput = {
  accessToken: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type GetNewTokensResponse = {
  __typename?: 'GetNewTokensResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type GetProductInput = {
  id: Scalars['String']['input'];
};

export type GetProjectInput = {
  id: Scalars['String']['input'];
};

export type GetPurchaseInput = {
  id: Scalars['String']['input'];
};

export type GetSearchResultsInput = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};

export type GetShippingPriceInput = {
  id: Scalars['String']['input'];
};

export type GetSimilarSearchResultsInput = {
  searchString: Scalars['String']['input'];
};

export type GetTransportationOptionsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  productId: Scalars['String']['input'];
  quantity?: InputMaybe<Scalars['Float']['input']>;
};

export type GetUserInput = {
  id: Scalars['String']['input'];
};

export type LatestPurchaseInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type ListArticlesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type ListArticlesResponse = {
  __typename?: 'ListArticlesResponse';
  articles: Array<Article>;
  total: Scalars['Int']['output'];
};

export type ListBrandsInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type ListBrandsResponse = {
  __typename?: 'ListBrandsResponse';
  brands: Array<Brand>;
  total: Scalars['Int']['output'];
};

export type ListPageContentInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type ListPageContentResponse = {
  __typename?: 'ListPageContentResponse';
  pages: Array<PageContent>;
  total: Scalars['Int']['output'];
};

export type LocationInputType = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type LocationResponse = {
  __typename?: 'LocationResponse';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type LocationSearchInput = {
  searchString: Scalars['String']['input'];
};

export type LocationSearchResponse = {
  __typename?: 'LocationSearchResponse';
  result: Array<Scalars['String']['output']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type LogoutInput = {
  accessToken: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type MapPinGroup = {
  __typename?: 'MapPinGroup';
  location: LocationResponse;
  prices?: Maybe<Array<Scalars['Float']['output']>>;
  productIds: Array<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  type: MapPinTypeEnum;
};

export type MapPinGroupsInput = {
  northEast: PointInput;
  productsInput?: InputMaybe<ProductsInput>;
  projectsInput?: InputMaybe<ProjectsInput>;
  southWest: PointInput;
  zoom?: InputMaybe<Scalars['Int']['input']>;
};

export type MapPinGroupsResponse = {
  __typename?: 'MapPinGroupsResponse';
  mapPinGroups: Array<MapPinGroup>;
  total: Scalars['Float']['output'];
};

export enum MapPinTypeEnum {
  Featured = 'FEATURED',
  Hub = 'HUB',
  Product = 'PRODUCT',
  Project = 'PROJECT',
  User = 'USER'
}

export type MarkAsReadInput = {
  conversationId: Scalars['String']['input'];
};

export type MarkPurchaseAsDeliveredInput = {
  purchaseId: Scalars['String']['input'];
};

export type MeasurementInput = {
  diameter?: InputMaybe<Scalars['Float']['input']>;
  diameterUnit?: InputMaybe<MeasurementUnitEnum>;
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<MeasurementUnitEnum>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lengthUnit?: InputMaybe<MeasurementUnitEnum>;
  thickness?: InputMaybe<Scalars['Float']['input']>;
  thicknessUnit?: InputMaybe<MeasurementUnitEnum>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<MeasurementUnitEnum>;
  width?: InputMaybe<Scalars['Float']['input']>;
  widthUnit?: InputMaybe<MeasurementUnitEnum>;
};

export enum MeasurementTypeEnum {
  Diameter = 'DIAMETER',
  Height = 'HEIGHT',
  Length = 'LENGTH',
  Thickness = 'THICKNESS',
  Weight = 'WEIGHT',
  Width = 'WIDTH'
}

export enum MeasurementUnitEnum {
  Cm = 'CM',
  Dm = 'DM',
  Kg = 'KG',
  M = 'M',
  Mm = 'MM'
}

export type Message = {
  __typename?: 'Message';
  conversationId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentPutUrls?: Maybe<Array<Scalars['String']['output']>>;
  documents: Array<File>;
  id: Scalars['ID']['output'];
  imagePutUrls?: Maybe<Array<Scalars['String']['output']>>;
  images: Array<File>;
  message: Scalars['String']['output'];
  messageType: MessageTypeEnum;
  receiver?: Maybe<User>;
  receiverId?: Maybe<Scalars['ID']['output']>;
  sender?: Maybe<User>;
  senderId?: Maybe<Scalars['ID']['output']>;
};

export enum MessageTypeEnum {
  System = 'SYSTEM',
  User = 'USER'
}

export type Mutation = {
  __typename?: 'Mutation';
  abortPurchase: Purchase;
  acceptPurchase: Purchase;
  addPayoutAccount: User;
  analyzeProductImages: Product;
  cancelPurchase: Purchase;
  clearSearchHistory: Scalars['Boolean']['output'];
  cmsCreateArticle: Article;
  cmsCreateBanner: CmsCreateBannerResponse;
  cmsCreateBrand: Brand;
  cmsCreateCategory: CmsCreateCategoryResponse;
  cmsCreateFiles: CmsCreateFilesResponse;
  cmsCreateFooterSection: FooterSection;
  cmsCreatePartner: CmsCreatePartnerResponse;
  cmsCreateProduct: CmsCreateProductResponse;
  cmsCreateProject: Project;
  cmsDeleteArticle: Scalars['Boolean']['output'];
  cmsDeleteBrand: Scalars['Boolean']['output'];
  cmsDeleteFile: File;
  cmsDeleteFooterSection: Scalars['Boolean']['output'];
  cmsDeletePartner: Scalars['Boolean']['output'];
  cmsDeleteProduct: Product;
  cmsDeleteProject: Scalars['Boolean']['output'];
  cmsHideProduct: Product;
  cmsListPurchases: CmsListPurchasesResponse;
  cmsLogin: LoginResponse;
  cmsReassignBrand: CmsReassignBrandResponse;
  cmsRefundPurchase: Purchase;
  cmsResolveReportPurchase: ReportPurchase;
  cmsTestTemplate: Scalars['Boolean']['output'];
  cmsUnhideProduct: Product;
  cmsUpdateArticle: Article;
  cmsUpdateBanner: CmsCreateBannerResponse;
  cmsUpdateBrand: Brand;
  cmsUpdateCO2Factor: Co2Factor;
  cmsUpdateCategoriesOrder: Scalars['Boolean']['output'];
  cmsUpdateCategory: CmsUpdateCategoryResponse;
  cmsUpdateFooterSection: FooterSection;
  cmsUpdatePartner: CmsCreatePartnerResponse;
  cmsUpdateProduct: CmsUpdateProductResponse;
  cmsUpdateProject: Project;
  cmsUpdateUser: User;
  createBrandByUser: Brand;
  createDraftProduct: Product;
  createMessage: Message;
  createOrganizationUser: User;
  createProduct: CreateProductResponse;
  createProject: Project;
  createReportProduct: ReportProduct;
  createReportPurchase: ReportPurchase;
  createReview: Review;
  createSearchResult?: Maybe<SearchResult>;
  deleteAccount: User;
  deleteConnectedAccount: Scalars['Boolean']['output'];
  deleteDraft: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  finalizeUser: User;
  getNewTokens: GetNewTokensResponse;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  markConversationAsRead: Conversation;
  markPurchaseAsDelivered: Purchase;
  newPassword: LoginResponse;
  onboardSellerAccount: OnboardSellerAccountResponse;
  purchaseProduct: PurchaseProductResponse;
  registerUser: User;
  removeProduct: Product;
  resendVerificationMail: ResendVerificationMailResponse;
  resetPassword: ResetPasswordResponse;
  setLikeProduct: Product;
  setLikeProject: Project;
  signupNewsLetter: Scalars['Boolean']['output'];
  switchAccount: LoginResponse;
  syncApproximateLocations: Scalars['Boolean']['output'];
  syncCO2Factors: Scalars['Boolean']['output'];
  updateOrganizationUser: User;
  updatePageContent: PageContent;
  updateProduct: UpdateProductResponse;
  updateProject: Project;
  updateUser: UpdateUserResponse;
  verifyEmail: LoginResponse;
};


export type MutationAbortPurchaseArgs = {
  input: AbortPurchaseInput;
};


export type MutationAcceptPurchaseArgs = {
  input: AcceptPurchaseInput;
};


export type MutationAddPayoutAccountArgs = {
  token: Scalars['String']['input'];
};


export type MutationAnalyzeProductImagesArgs = {
  input: AnalyzeProductImagesInput;
};


export type MutationCancelPurchaseArgs = {
  input: CancelPurchaseInput;
};


export type MutationCmsCreateArticleArgs = {
  input: CmsCreateArticleInput;
};


export type MutationCmsCreateBannerArgs = {
  input: CmsCreateBannerInput;
};


export type MutationCmsCreateBrandArgs = {
  input: CmsCreateBrandInput;
};


export type MutationCmsCreateCategoryArgs = {
  input: CmsCreateCategoryInput;
};


export type MutationCmsCreateFilesArgs = {
  input: CmsCreateFilesInput;
};


export type MutationCmsCreateFooterSectionArgs = {
  input: CmsCreateFooterSectionInput;
};


export type MutationCmsCreatePartnerArgs = {
  input: CmsCreatePartnerInput;
};


export type MutationCmsCreateProductArgs = {
  input: CmsCreateProductInput;
};


export type MutationCmsCreateProjectArgs = {
  input: CmsCreateProjectInput;
};


export type MutationCmsDeleteArticleArgs = {
  articleId: Scalars['String']['input'];
};


export type MutationCmsDeleteBrandArgs = {
  input: CmsBrandIdInput;
};


export type MutationCmsDeleteFileArgs = {
  id: Scalars['String']['input'];
};


export type MutationCmsDeleteFooterSectionArgs = {
  footerSectionId: Scalars['String']['input'];
};


export type MutationCmsDeletePartnerArgs = {
  input: CmsDeletePartnerInput;
};


export type MutationCmsDeleteProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCmsDeleteProjectArgs = {
  projectId: Scalars['String']['input'];
};


export type MutationCmsHideProductArgs = {
  hiddenReason: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};


export type MutationCmsListPurchasesArgs = {
  input: CmsListPurchasesInput;
};


export type MutationCmsLoginArgs = {
  input: LoginInput;
};


export type MutationCmsReassignBrandArgs = {
  input: CmsReassignBrandInput;
};


export type MutationCmsRefundPurchaseArgs = {
  input: CmsRefundPurchaseInput;
};


export type MutationCmsResolveReportPurchaseArgs = {
  input: CmsResolveReportPurchaseInput;
};


export type MutationCmsTestTemplateArgs = {
  input: CmsTestTemplateInput;
};


export type MutationCmsUnhideProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCmsUpdateArticleArgs = {
  input: CmsUpdateArticleInput;
};


export type MutationCmsUpdateBannerArgs = {
  input: CmsUpdateBannerInput;
};


export type MutationCmsUpdateBrandArgs = {
  input: CmsUpdateBrandInput;
};


export type MutationCmsUpdateCo2FactorArgs = {
  input: CmsUpdateCo2Factor;
};


export type MutationCmsUpdateCategoriesOrderArgs = {
  input: CmsUpdateCategoriesInput;
};


export type MutationCmsUpdateCategoryArgs = {
  input: CmsUpdateCategoryInput;
};


export type MutationCmsUpdateFooterSectionArgs = {
  input: CmsUpdateFooterSectionInput;
};


export type MutationCmsUpdatePartnerArgs = {
  input: CmsUpdatePartnerInput;
};


export type MutationCmsUpdateProductArgs = {
  input: CmsUpdateProductInput;
};


export type MutationCmsUpdateProjectArgs = {
  input: CmsUpdateProjectInput;
};


export type MutationCmsUpdateUserArgs = {
  input: CmsUpdateUsersInput;
};


export type MutationCreateBrandByUserArgs = {
  input: CreateBrandByUserInput;
};


export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};


export type MutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateReportProductArgs = {
  input: CreateReportProductInput;
};


export type MutationCreateReportPurchaseArgs = {
  input: CreateReportPurchaseInput;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateSearchResultArgs = {
  input: CreateSearchResultInput;
};


export type MutationDeleteConnectedAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteDraftArgs = {
  input: RemoveProductInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationFinalizeUserArgs = {
  input: FinalizeUserInput;
};


export type MutationGetNewTokensArgs = {
  input: GetNewTokensInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  input: LogoutInput;
};


export type MutationMarkConversationAsReadArgs = {
  input: MarkAsReadInput;
};


export type MutationMarkPurchaseAsDeliveredArgs = {
  input: MarkPurchaseAsDeliveredInput;
};


export type MutationNewPasswordArgs = {
  input: NewPasswordInput;
};


export type MutationPurchaseProductArgs = {
  input: PurchaseProductInput;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationRemoveProductArgs = {
  input: RemoveProductInput;
};


export type MutationResendVerificationMailArgs = {
  input: ResendVerificationMailInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationSetLikeProductArgs = {
  input: SetLikeProductInput;
};


export type MutationSetLikeProjectArgs = {
  input: SetLikeProjectInput;
};


export type MutationSignupNewsLetterArgs = {
  email: Scalars['String']['input'];
};


export type MutationSwitchAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateOrganizationUserArgs = {
  input: UpdateOrganizationUserInput;
};


export type MutationUpdatePageContentArgs = {
  input: UpdatePageContentInput;
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};

export type MyPurchaseInput = {
  productId: Scalars['String']['input'];
};

export type MyPurchasesInput = {
  myRole?: InputMaybe<Scalars['String']['input']>;
};

export type NearbyServicePointsInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  postalCode: Scalars['String']['input'];
  shippingProvider: ShippingProviderEnum;
};

export type NewPasswordInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  resetPasswordToken: Scalars['String']['input'];
};

export type OnboardSellerAccountResponse = {
  __typename?: 'OnboardSellerAccountResponse';
  clientSecret: Scalars['String']['output'];
  fields: Array<Scalars['String']['output']>;
  user: User;
};

export enum OrderCategoriesEnum {
  OrderIndexAsc = 'ORDER_INDEX_ASC',
  OrderIndexDesc = 'ORDER_INDEX_DESC'
}

export enum OrderProductsEnum {
  BestMatch = 'BEST_MATCH',
  Distance = 'DISTANCE',
  Latest = 'LATEST',
  Oldest = 'OLDEST',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC'
}

export enum OrderUsersEnum {
  Alphabetical = 'ALPHABETICAL'
}

export type PageContent = {
  __typename?: 'PageContent';
  createdAt: Scalars['DateTime']['output'];
  heroHtml: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  page: PageEnum;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PageEnum {
  Contract = 'CONTRACT',
  Partner = 'PARTNER'
}

export type PaginatedProductsResponse = {
  __typename?: 'PaginatedProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export type Partner = {
  __typename?: 'Partner';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  logo: File;
  name: Scalars['String']['output'];
  websiteUrl?: Maybe<Scalars['String']['output']>;
};

export enum PaymentMethod {
  Card = 'CARD',
  Swish = 'SWISH'
}

export type PayoutAccount = {
  __typename?: 'PayoutAccount';
  bankName?: Maybe<Scalars['String']['output']>;
  last4?: Maybe<Scalars['String']['output']>;
  routingNumber?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type PointInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type PopularCategoriesInput = {
  limit: Scalars['Int']['input'];
};

export type Product = {
  __typename?: 'Product';
  additionalInfo?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  approximatePlace?: Maybe<ApproximatePlaceResponse>;
  brand?: Maybe<Brand>;
  canDelete: Scalars['Boolean']['output'];
  category?: Maybe<Category>;
  co2SavingBuyer?: Maybe<Scalars['Float']['output']>;
  co2SavingSeller?: Maybe<Scalars['Float']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  colorType: ColorTypeEnum;
  condition: ProductConditionEnum;
  createdAt: Scalars['DateTime']['output'];
  deliveryEnabled: Scalars['Boolean']['output'];
  deliveryPrice?: Maybe<Scalars['Float']['output']>;
  deliveryRadius?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diameter?: Maybe<Scalars['Float']['output']>;
  diameterUnit: MeasurementUnitEnum;
  distanceFromLocation?: Maybe<Scalars['Float']['output']>;
  distanceFromPosition?: Maybe<Scalars['Float']['output']>;
  documents: Array<File>;
  hasOngoingPurchase: Scalars['Boolean']['output'];
  height?: Maybe<Scalars['Float']['output']>;
  heightUnit: MeasurementUnitEnum;
  hiddenReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images: Array<File>;
  isGiveaway: Scalars['Boolean']['output'];
  length?: Maybe<Scalars['Float']['output']>;
  lengthUnit: MeasurementUnitEnum;
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<LocationResponse>;
  minimumPrice: Scalars['Int']['output'];
  noProject?: Maybe<Scalars['Boolean']['output']>;
  pickupEnabled: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
  primaryImage?: Maybe<File>;
  primaryQuantity?: Maybe<Scalars['Float']['output']>;
  primaryUnit?: Maybe<QuantityUnitEnum>;
  project?: Maybe<Project>;
  reportProducts: Array<ReportProduct>;
  secondaryQuantity?: Maybe<Scalars['Float']['output']>;
  secondaryUnit?: Maybe<QuantityUnitEnum>;
  seller: User;
  sellerId: Scalars['String']['output'];
  shippingPrices?: Maybe<Array<ShippingPrice>>;
  similarProducts: PaginatedProductsResponse;
  soldByQuantity: Scalars['Boolean']['output'];
  status: ProductStatusEnum;
  thickness?: Maybe<Scalars['Float']['output']>;
  thicknessUnit: MeasurementUnitEnum;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
  weightUnit: MeasurementUnitEnum;
  width?: Maybe<Scalars['Float']['output']>;
  widthUnit: MeasurementUnitEnum;
};


export type ProductDistanceFromLocationArgs = {
  location?: InputMaybe<LocationInputType>;
};


export type ProductHasOngoingPurchaseArgs = {
  includeOwnPurchases?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ProductShippingPricesArgs = {
  quantity?: InputMaybe<Scalars['Int']['input']>;
};


export type ProductSimilarProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export enum ProductConditionEnum {
  Bad = 'BAD',
  Good = 'GOOD',
  New = 'NEW',
  Okay = 'OKAY',
  VeryGood = 'VERY_GOOD'
}

export type ProductPriceRangeResponse = {
  __typename?: 'ProductPriceRangeResponse';
  max: Scalars['Int']['output'];
  min: Scalars['Int']['output'];
};

export enum ProductStatusEnum {
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Sold = 'SOLD'
}

export type ProductsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['String']['input']>>;
  conditions?: InputMaybe<Array<ProductConditionEnum>>;
  delivery?: InputMaybe<Scalars['Boolean']['input']>;
  distance?: InputMaybe<Scalars['Float']['input']>;
  excludeOwnProducts?: InputMaybe<Scalars['Boolean']['input']>;
  giveaway?: InputMaybe<Scalars['Boolean']['input']>;
  likedByUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  location?: InputMaybe<LocationInputType>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  orderBy?: InputMaybe<OrderProductsEnum>;
  pickup?: InputMaybe<Scalars['Boolean']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
  selectionCategories?: InputMaybe<Scalars['Boolean']['input']>;
  sellerId?: InputMaybe<Scalars['String']['input']>;
  shipping?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ProductsRecommendationSourceEnum {
  Likes = 'LIKES',
  SearchHistory = 'SEARCH_HISTORY'
}

export type ProductsResponse = {
  __typename?: 'ProductsResponse';
  /** If address or location is supplied to Products(), this will have corresponding coordinates */
  origin?: Maybe<LocationResponse>;
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export type Project = {
  __typename?: 'Project';
  address: Scalars['String']['output'];
  approximatePlace: ApproximatePlaceResponse;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  location: LocationResponse;
  products: Array<Product>;
  projectPicture?: Maybe<File>;
  shortText?: Maybe<Scalars['String']['output']>;
  showDetailsOnMap: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  user: User;
};


export type ProjectProductsArgs = {
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectsInput = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Purchase = {
  __typename?: 'Purchase';
  abortedById?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  boughtForFree: Scalars['Boolean']['output'];
  buyer: User;
  buyerId: Scalars['String']['output'];
  canAbort?: Maybe<CanAbortResponse>;
  conversation?: Maybe<Conversation>;
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isFree: Scalars['Boolean']['output'];
  isRefunded: Scalars['Boolean']['output'];
  isShipping: Scalars['Boolean']['output'];
  pausedAt?: Maybe<Scalars['DateTime']['output']>;
  paymentAcceptedAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentStartedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutFailedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  payoutStartedAt?: Maybe<Scalars['DateTime']['output']>;
  product: Product;
  purchasedQuantity?: Maybe<Scalars['Float']['output']>;
  qrCodeContent?: Maybe<Scalars['String']['output']>;
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  reportPurchase?: Maybe<ReportPurchase>;
  reviews: Array<Review>;
  sellerRespondedAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentBookedAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentDeliveredAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentDroppedOffAt?: Maybe<Scalars['DateTime']['output']>;
  shipmentStartedAt?: Maybe<Scalars['DateTime']['output']>;
  shippingPrice?: Maybe<ShippingPrice>;
  status: PurchaseStatusEnum;
  toServicePointId?: Maybe<Scalars['String']['output']>;
  transportationMethod: TransportationEnum;
  updatedAt: Scalars['DateTime']['output'];
};

export type PurchaseProductInput = {
  deliverToAddress?: InputMaybe<Scalars['String']['input']>;
  deliverToLocation?: InputMaybe<LocationInputType>;
  failureUrl?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<PaymentMethod>;
  productId: Scalars['String']['input'];
  purchasedQuantity?: InputMaybe<Scalars['Int']['input']>;
  servicePointId?: InputMaybe<Scalars['String']['input']>;
  shippingProvider?: InputMaybe<ShippingProviderEnum>;
  successUrl?: InputMaybe<Scalars['String']['input']>;
  transportationMethod: TransportationEnum;
};

export type PurchaseProductResponse = {
  __typename?: 'PurchaseProductResponse';
  product: Product;
  purchase: Purchase;
  reference?: Maybe<Scalars['String']['output']>;
};

export enum PurchaseStatusEnum {
  Approved = 'APPROVED',
  Claimed = 'CLAIMED',
  Delivered = 'DELIVERED',
  FinishedFailed = 'FINISHED_FAILED',
  FinishedSuccess = 'FINISHED_SUCCESS',
  Paused = 'PAUSED',
  PaymentAccepted = 'PAYMENT_ACCEPTED',
  PaymentStarted = 'PAYMENT_STARTED',
  PayoutFailed = 'PAYOUT_FAILED',
  PayoutStarted = 'PAYOUT_STARTED',
  ShipmentBooked = 'SHIPMENT_BOOKED',
  ShipmentDroppedOff = 'SHIPMENT_DROPPED_OFF',
  ShippingDelivered = 'SHIPPING_DELIVERED',
  ShippingStarted = 'SHIPPING_STARTED'
}

export enum QuantityUnitEnum {
  Amount = 'AMOUNT',
  Bags = 'BAGS',
  Boards = 'BOARDS',
  Cans = 'CANS',
  Kg = 'KG',
  Liters = 'LITERS',
  M = 'M',
  M2 = 'M2',
  M3 = 'M3',
  Packages = 'PACKAGES',
  Plates = 'PLATES',
  Rolls = 'ROLLS'
}

export type Query = {
  __typename?: 'Query';
  addressToLocation: LocationResponse;
  article: Article;
  articleBySlug: Article;
  banners: Array<Banner>;
  brand: Brand;
  brands: Array<Brand>;
  categories: Array<Category>;
  category: Category;
  cmsBannerById: Banner;
  cmsGetProduct: Product;
  cmsGetUser: User;
  cmsGetUserProjects: Array<Project>;
  cmsListBanners: Array<Banner>;
  cmsListChatActions: Array<ChatActionEnum>;
  cmsListFiles: CmsListFilesResponse;
  cmsListProducts: CmsListProductsResponse;
  cmsListProjects: CmsListProjectsResponse;
  cmsListUsers: CmsListUsersResponse;
  cmsPreviewSystemMessage: Scalars['String']['output'];
  cmsProductStatistics: CmsProductStatisticsResponse;
  cmsPurchaseStatistics: CmsPurchaseStatisticsResponse;
  cmsUserStatistics: CmsUserStatisticsResponse;
  co2Factors: Array<Co2Factor>;
  exactAndApproximatePlace: ExactAndApproximatePlaceResponse;
  footerSection: FooterSection;
  getAllShippingPrices: Array<ShippingPrice>;
  getCategories: Array<Category>;
  getConversation: Conversation;
  getConversations: Array<Conversation>;
  getDeliveryOption?: Maybe<DeliveryOptionResponse>;
  getDraftedProduct?: Maybe<Product>;
  getOrCreateDraftProduct: Product;
  getPickupOption?: Maybe<ApproximatePlaceResponse>;
  getProductPriceRange: ProductPriceRangeResponse;
  getProject: Project;
  getSearchResults: Array<SearchResult>;
  getShippingOptions: Array<ShippingOptionResponse>;
  getShippingPrice: ShippingPrice;
  getSimilarSearchResults: Array<SearchResult>;
  getUnreadConversationsCount: Scalars['Int']['output'];
  latestPurchase?: Maybe<Purchase>;
  listArticles: ListArticlesResponse;
  listBrands: ListBrandsResponse;
  listFooterSection: Array<FooterSection>;
  listPageContents: ListPageContentResponse;
  locationSearch: LocationSearchResponse;
  locationToAddress: GetAddressResponse;
  mapPinGroups: MapPinGroupsResponse;
  me: User;
  myProjects: Array<Project>;
  myPurchase?: Maybe<Purchase>;
  myPurchases: Array<Purchase>;
  nearbyServicePoints: Array<ServicePointResponse>;
  pageContentById: PageContent;
  pageContentByPage: PageContent;
  partners: Array<Partner>;
  popularCategories: Array<Category>;
  product: Product;
  products: ProductsResponse;
  purchase: Purchase;
  rootCategories: Array<Category>;
  user: User;
  userExists?: Maybe<User>;
  usernameIsValid: Scalars['Boolean']['output'];
  users: UsersResponse;
};


export type QueryAddressToLocationArgs = {
  input: AddressToLocationInput;
};


export type QueryArticleArgs = {
  id: Scalars['String']['input'];
};


export type QueryArticleBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryBrandArgs = {
  id: Scalars['String']['input'];
};


export type QueryBrandsArgs = {
  input?: InputMaybe<BrandsInput>;
};


export type QueryCategoriesArgs = {
  input: CategoriesInput;
};


export type QueryCategoryArgs = {
  input: CategoryInput;
};


export type QueryCmsBannerByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryCmsGetProductArgs = {
  productId: Scalars['String']['input'];
};


export type QueryCmsGetUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryCmsGetUserProjectsArgs = {
  sellerId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCmsListFilesArgs = {
  input: CmsListFilesInput;
};


export type QueryCmsListProductsArgs = {
  input: CmsListProductsInput;
};


export type QueryCmsListProjectsArgs = {
  input: CmsListProjectsInput;
};


export type QueryCmsListUsersArgs = {
  input: CmsListUsersInput;
};


export type QueryCmsPreviewSystemMessageArgs = {
  input: CmsPreviewSystemMessageInput;
};


export type QueryCmsProductStatisticsArgs = {
  input?: InputMaybe<CmsProductStatisticsInput>;
};


export type QueryCmsPurchaseStatisticsArgs = {
  input?: InputMaybe<CmsPurchaseStatisticsInput>;
};


export type QueryCmsUserStatisticsArgs = {
  input?: InputMaybe<CmsUserStatisticsInput>;
};


export type QueryExactAndApproximatePlaceArgs = {
  input: LocationInputType;
};


export type QueryFooterSectionArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetCategoriesArgs = {
  input: GetCategoriesInput;
};


export type QueryGetConversationArgs = {
  input: GetConversationInput;
};


export type QueryGetConversationsArgs = {
  input: GetConversationsInput;
};


export type QueryGetDeliveryOptionArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryGetPickupOptionArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryGetProjectArgs = {
  input: GetProjectInput;
};


export type QueryGetSearchResultsArgs = {
  input: GetSearchResultsInput;
};


export type QueryGetShippingOptionsArgs = {
  input: GetTransportationOptionsInput;
};


export type QueryGetShippingPriceArgs = {
  input: GetShippingPriceInput;
};


export type QueryGetSimilarSearchResultsArgs = {
  input: GetSimilarSearchResultsInput;
};


export type QueryLatestPurchaseArgs = {
  input: LatestPurchaseInput;
};


export type QueryListArticlesArgs = {
  input: ListArticlesInput;
};


export type QueryListBrandsArgs = {
  input: ListBrandsInput;
};


export type QueryListPageContentsArgs = {
  input: ListPageContentInput;
};


export type QueryLocationSearchArgs = {
  input: LocationSearchInput;
};


export type QueryLocationToAddressArgs = {
  input: GetAddressInput;
};


export type QueryMapPinGroupsArgs = {
  input: MapPinGroupsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyPurchaseArgs = {
  input: MyPurchaseInput;
};


export type QueryMyPurchasesArgs = {
  input: MyPurchasesInput;
};


export type QueryNearbyServicePointsArgs = {
  input: NearbyServicePointsInput;
};


export type QueryPageContentByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryPageContentByPageArgs = {
  page: Scalars['String']['input'];
};


export type QueryPopularCategoriesArgs = {
  input?: InputMaybe<PopularCategoriesInput>;
};


export type QueryProductArgs = {
  input: GetProductInput;
};


export type QueryProductsArgs = {
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPurchaseArgs = {
  input: GetPurchaseInput;
};


export type QueryRootCategoriesArgs = {
  input?: InputMaybe<RootCategoriesInput>;
};


export type QueryUserArgs = {
  input: GetUserInput;
};


export type QueryUserExistsArgs = {
  input: UserExistsInput;
};


export type QueryUsernameIsValidArgs = {
  username: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  input: UsersInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type RecommendedProductsInput = {
  excludeOwnProducts?: InputMaybe<Scalars['Boolean']['input']>;
  recommendationSource: ProductsRecommendationSourceEnum;
};

export enum RegisterStatusEnum {
  Details = 'DETAILS',
  Done = 'DONE',
  Email = 'EMAIL'
}

export type RegisterUserInput = {
  email: Scalars['String']['input'];
};

export type RemoveProductInput = {
  id: Scalars['String']['input'];
};

export type ReportProduct = {
  __typename?: 'ReportProduct';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  reporterId: Scalars['String']['output'];
  type: ReportProductTypeEnum;
};

export enum ReportProductTypeEnum {
  DuplicateOrSpam = 'DUPLICATE_OR_SPAM',
  IncorrectInformation = 'INCORRECT_INFORMATION',
  IrrelevantProduct = 'IRRELEVANT_PRODUCT',
  MisleadingAdvertisement = 'MISLEADING_ADVERTISEMENT',
  Other = 'OTHER',
  UnreasonablePrice = 'UNREASONABLE_PRICE'
}

export type ReportPurchase = {
  __typename?: 'ReportPurchase';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  resolution?: Maybe<ReportPurchaseResolutionEnum>;
  type: ReportPurchaseTypeEnum;
};

export enum ReportPurchaseResolutionEnum {
  Other = 'OTHER',
  Proceed = 'PROCEED',
  Refund = 'REFUND'
}

export enum ReportPurchaseTypeEnum {
  Damaged = 'DAMAGED',
  NotAsDescribed = 'NOT_AS_DESCRIBED',
  Other = 'OTHER',
  ProductMissing = 'PRODUCT_MISSING',
  WrongProduct = 'WRONG_PRODUCT'
}

export type ResendVerificationMailInput = {
  email: Scalars['String']['input'];
};

export type ResendVerificationMailResponse = {
  __typename?: 'ResendVerificationMailResponse';
  message: Scalars['String']['output'];
};

export type ResetPasswordInput = {
  email: Scalars['String']['input'];
};

export type ResetPasswordResponse = {
  __typename?: 'ResetPasswordResponse';
  message: Scalars['String']['output'];
};

export type Review = {
  __typename?: 'Review';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  purchase: Purchase;
  review: Scalars['String']['output'];
  reviewee: User;
  revieweeId: Scalars['String']['output'];
  reviewer: User;
  reviewerId: Scalars['String']['output'];
  stars: Scalars['Int']['output'];
};

export type RootCategoriesInput = {
  orderBy?: InputMaybe<OrderCategoriesEnum>;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  count: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  searchString: Scalars['String']['output'];
};

export type ServicePointResponse = {
  __typename?: 'ServicePointResponse';
  city: Scalars['String']['output'];
  distance: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  streetName: Scalars['String']['output'];
  streetNumber: Scalars['String']['output'];
};

export type SetLikeProductInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
};

export type SetLikeProjectInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
};

export type ShippingOptionResponse = {
  __typename?: 'ShippingOptionResponse';
  servicePoints: Array<ServicePointResponse>;
  shippingPrice: ShippingPrice;
};

export type ShippingPrice = {
  __typename?: 'ShippingPrice';
  id: Scalars['ID']['output'];
  maxWeight: Scalars['Float']['output'];
  price: Scalars['Float']['output'];
  provider: ShippingProviderEnum;
};

export enum ShippingProviderEnum {
  Dhl = 'DHL',
  Postnord = 'POSTNORD'
}

export enum SystemMessageRoleEnum {
  Buyer = 'BUYER',
  Seller = 'SELLER'
}

export enum SystemMessageStepEnum {
  HandoffConfirmed = 'HANDOFF_CONFIRMED',
  LateShippingDropOff = 'LATE_SHIPPING_DROP_OFF',
  PurchaseAbortedByBuyer = 'PURCHASE_ABORTED_BY_BUYER',
  PurchaseAbortedBySeller = 'PURCHASE_ABORTED_BY_SELLER',
  PurchaseInitiated = 'PURCHASE_INITIATED',
  PurchaseReported = 'PURCHASE_REPORTED',
  PurchaseSuccess = 'PURCHASE_SUCCESS',
  SellerResponded = 'SELLER_RESPONDED',
  ShipmentArrived = 'SHIPMENT_ARRIVED',
  ShipmentDelivered = 'SHIPMENT_DELIVERED',
  ShipmentDroppedOff = 'SHIPMENT_DROPPED_OFF',
  SupportConcluded = 'SUPPORT_CONCLUDED'
}

export enum TransportationEnum {
  Delivery = 'DELIVERY',
  Pickup = 'PICKUP',
  Shipping = 'SHIPPING'
}

export type UpdateOrganizationUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  organizationName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePageContentInput = {
  heroHtml: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type UpdateProductInput = {
  addDocuments?: InputMaybe<Array<FileInputType>>;
  addImages?: InputMaybe<Array<FileInputType>>;
  additionalInfo?: InputMaybe<Scalars['String']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  colorType?: InputMaybe<ColorTypeEnum>;
  condition?: InputMaybe<ProductConditionEnum>;
  deliveryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  diameter?: InputMaybe<Scalars['Float']['input']>;
  diameterUnit?: InputMaybe<MeasurementUnitEnum>;
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<MeasurementUnitEnum>;
  id: Scalars['String']['input'];
  isGiveAway?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lengthUnit?: InputMaybe<MeasurementUnitEnum>;
  location?: InputMaybe<LocationInputType>;
  noProject?: InputMaybe<Scalars['Boolean']['input']>;
  pickupEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  primaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  primaryUnit?: InputMaybe<QuantityUnitEnum>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  removeDocuments?: InputMaybe<Array<Scalars['String']['input']>>;
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
  soldByQuantity?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<ProductStatusEnum>;
  thickness?: InputMaybe<Scalars['Float']['input']>;
  thicknessUnit?: InputMaybe<MeasurementUnitEnum>;
  title?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<MeasurementUnitEnum>;
  width?: InputMaybe<Scalars['Float']['input']>;
  widthUnit?: InputMaybe<MeasurementUnitEnum>;
};

export type UpdateProductResponse = {
  __typename?: 'UpdateProductResponse';
  documentPutUrls: Array<Scalars['String']['output']>;
  imagePutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type UpdateProjectInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  location?: InputMaybe<LocationInputType>;
  shortText?: InputMaybe<Scalars['String']['input']>;
  showDetailsOnMap?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  notifyOnMessage?: InputMaybe<Scalars['Boolean']['input']>;
  notifyOnPurchaseUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<FileInputType>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserResponse = {
  __typename?: 'UpdateUserResponse';
  profilePicturePutUrl?: Maybe<Scalars['String']['output']>;
  user: User;
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isFeatured: Scalars['Boolean']['output'];
  likedProducts?: Maybe<ProductsResponse>;
  likedProjects?: Maybe<Array<Project>>;
  location?: Maybe<LocationResponse>;
  name?: Maybe<Scalars['String']['output']>;
  notifyOnMessage: Scalars['Boolean']['output'];
  notifyOnPurchaseUpdate: Scalars['Boolean']['output'];
  numberOfPublishedProducts: Scalars['Int']['output'];
  numberOfSoldProducts: Scalars['Int']['output'];
  organizationAccount?: Maybe<User>;
  organizationApprovedAt?: Maybe<Scalars['DateTime']['output']>;
  organizationNumber?: Maybe<Scalars['String']['output']>;
  organizationOwner?: Maybe<User>;
  payoutAccount?: Maybe<PayoutAccount>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  postCode?: Maybe<Scalars['String']['output']>;
  products: Array<Product>;
  profilePicture?: Maybe<File>;
  projects: Array<Project>;
  purchases: Array<Purchase>;
  rating?: Maybe<Scalars['Float']['output']>;
  recommendedProducts: Array<Product>;
  registrationStatus: RegisterStatusEnum;
  reviewed: Array<Review>;
  role: UserRoleEnum;
  sales: Array<Purchase>;
  sellerAccountIsCreated: Scalars['Boolean']['output'];
  sellerAccountIsEnabled: Scalars['Boolean']['output'];
  totalCO2Savings: Scalars['Float']['output'];
  type: UserType;
  username?: Maybe<Scalars['String']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
};


export type UserLikedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type UserRecommendedProductsArgs = {
  input: RecommendedProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type UserExistsInput = {
  email: Scalars['String']['input'];
};

export enum UserRoleEnum {
  Admin = 'ADMIN',
  User = 'USER'
}

export enum UserType {
  Business = 'BUSINESS',
  Personal = 'PERSONAL'
}

export type UsersInput = {
  hasProject?: InputMaybe<Scalars['Boolean']['input']>;
  isPromoted?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<OrderUsersEnum>;
  type?: InputMaybe<UserType>;
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  total: Scalars['Int']['output'];
  users: Array<User>;
};

export type VerifyEmailInput = {
  email: Scalars['String']['input'];
  verifyEmailToken: Scalars['String']['input'];
};
