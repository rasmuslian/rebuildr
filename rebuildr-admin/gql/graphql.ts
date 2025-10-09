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
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ArticleFooterSection = {
  __typename?: 'ArticleFooterSection';
  article: Article;
  articleId: Scalars['ID']['output'];
  footerSectionId: Scalars['ID']['output'];
  orderIndex: Scalars['Float']['output'];
};

export type ArticleOrderInput = {
  articleId: Scalars['String']['input'];
  orderIndex: Scalars['Int']['input'];
};

export enum AuthResponseStatusEnum {
  Error = 'ERROR',
  Pending = 'PENDING',
  Success = 'SUCCESS'
}

export type AuthenticateResponse = {
  __typename?: 'AuthenticateResponse';
  autoStartToken?: Maybe<Scalars['String']['output']>;
  qrCode?: Maybe<Scalars['String']['output']>;
  status: AuthResponseStatusEnum;
};

export type AuthenticateRockerInput = {
  requestId: Scalars['String']['input'];
};

export type Brand = {
  __typename?: 'Brand';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: BrandTypeEnum;
};

export enum BrandTypeEnum {
  Other = 'OTHER',
  Regular = 'REGULAR'
}

export type CancelPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CategoriesInput = {
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Category = {
  __typename?: 'Category';
  ancestorIds: Array<Scalars['String']['output']>;
  brands: Array<Brand>;
  children: Array<Category>;
  description: Scalars['String']['output'];
  hasChildren: Scalars['Boolean']['output'];
  icon?: Maybe<CategoryIconEnum>;
  id: Scalars['ID']['output'];
  image?: Maybe<File>;
  inSeason: Scalars['Boolean']['output'];
  inSelection: Scalars['Boolean']['output'];
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

export type CmsCreateArticleInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CmsCreateFooterSectionInput = {
  articles: Array<ArticleOrderInput>;
  orderIndex: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CmsCreateProductInput = {
  brandId: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  condition: ProductConditionEnum;
  description: Scalars['String']['input'];
  images: Array<FileInputType>;
  price: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CmsCreateProductResponse = {
  __typename?: 'CmsCreateProductResponse';
  imagePutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type CmsListImagesInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type CmsListImagesResponse = {
  __typename?: 'CmsListImagesResponse';
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

export type CmsUpdateArticleInput = {
  body: Scalars['String']['input'];
  id: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CmsUpdateCategoryInput = {
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  image?: InputMaybe<FileInputType>;
  inSeason: Scalars['Boolean']['input'];
  inSelection: Scalars['Boolean']['input'];
};

export type CmsUpdateCategoryResponse = {
  __typename?: 'CmsUpdateCategoryResponse';
  category: Category;
  imagePutUrl?: Maybe<Scalars['String']['output']>;
};

export type CmsUpdateFooterSectionInput = {
  articles: Array<ArticleOrderInput>;
  id: Scalars['String']['input'];
  orderIndex: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CmsUpdateProductInput = {
  addImages?: InputMaybe<Array<FileInputType>>;
  brandId: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  condition: ProductConditionEnum;
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type CmsUpdateProductResponse = {
  __typename?: 'CmsUpdateProductResponse';
  imagePutUrls: Array<Scalars['String']['output']>;
  product: Product;
};

export type CmsUploadFileInput = {
  images?: InputMaybe<Array<FileInputType>>;
};

export type CmsUploadFileResponse = {
  __typename?: 'CmsUploadFileResponse';
  presignedPutUrls: Array<Scalars['String']['output']>;
};

export type CreateMessageInput = {
  message: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  receiverId: Scalars['String']['input'];
};

export type CreateOrganizationUserInput = {
  creatorId: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  organizationNumber: Scalars['String']['input'];
};

export type CreatePayoutAccountInput = {
  accountName?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  clearingNumber?: InputMaybe<Scalars['String']['input']>;
  failureUrl?: InputMaybe<Scalars['String']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  successUrl?: InputMaybe<Scalars['String']['input']>;
  type: PayoutAccountEnum;
};

export type CreatePayoutAccountResponse = {
  __typename?: 'CreatePayoutAccountResponse';
  trustlyUrl?: Maybe<Scalars['String']['output']>;
  user: User;
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

export type FinalizeUserInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type FooterSection = {
  __typename?: 'FooterSection';
  articleFooterSections: Array<ArticleFooterSection>;
  id: Scalars['ID']['output'];
  orderIndex: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

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
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
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
};

export type GetUserInput = {
  id: Scalars['String']['input'];
};

export type GetUsersInput = {
  name: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type HideProductInput = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
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

export type MarkAsReadInput = {
  markAsRead: Scalars['Boolean']['input'];
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type MarkPurchaseAsDeliveredInput = {
  purchaseId: Scalars['String']['input'];
};

export enum MeasurementUnitEnum {
  Cm = 'CM',
  Dm = 'DM',
  Kg = 'KG',
  M = 'M',
  Mm = 'MM'
}

export type Message = {
  __typename?: 'Message';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  messageType: MessageTypeEnum;
  product: Product;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  receiver: User;
  receiverId: Scalars['ID']['output'];
  sender: User;
  senderId: Scalars['ID']['output'];
};

export enum MessageTypeEnum {
  System = 'SYSTEM',
  User = 'USER'
}

export type Mutation = {
  __typename?: 'Mutation';
  abortPurchase: Purchase;
  acceptPurchase: Purchase;
  authenticateRocker: AuthenticateResponse;
  cancelPurchase: Scalars['Boolean']['output'];
  clearSearchHistory: Scalars['Boolean']['output'];
  cmsCreateArticle: Article;
  cmsCreateFooterSection: FooterSection;
  cmsCreateProduct: CmsCreateProductResponse;
  cmsDeleteArticle: Scalars['Boolean']['output'];
  cmsDeleteFile: Scalars['Boolean']['output'];
  cmsDeleteFooterSection: Scalars['Boolean']['output'];
  cmsDeleteProduct: Product;
  cmsHideProduct: Product;
  cmsLogin: LoginResponse;
  cmsUnhideProduct: Product;
  cmsUpdateArticle: Article;
  cmsUpdateCategory: CmsUpdateCategoryResponse;
  cmsUpdateFooterSection: FooterSection;
  cmsUpdateProduct: CmsUpdateProductResponse;
  cmsUploadFiles: CmsUploadFileResponse;
  createDraftProduct: Product;
  createMessage: Message;
  createOrganizationUser: User;
  createPayoutAccount: CreatePayoutAccountResponse;
  createProduct: CreateProductResponse;
  createProject: Project;
  createReportProduct: ReportProduct;
  createReportPurchase: ReportPurchase;
  createReview: Review;
  createSearchResult?: Maybe<SearchResult>;
  deleteAccount: User;
  deleteDraft: Scalars['Boolean']['output'];
  finalizeUser: User;
  getNewTokens: GetNewTokensResponse;
  hideProduct: Product;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  markConversationAsRead: Array<Message>;
  markPurchaseAsDelivered: Purchase;
  newPassword: LoginResponse;
  purchaseProduct: PurchaseProductResponse;
  registerUser: User;
  removeProduct: Product;
  resendVerificationMail: ResendVerificationMailResponse;
  resetPassword: ResetPasswordResponse;
  selectPayoutMethod: User;
  setLikeProduct: Product;
  setLikeProject: Project;
  showProduct: Product;
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


export type MutationAuthenticateRockerArgs = {
  input: AuthenticateRockerInput;
};


export type MutationCancelPurchaseArgs = {
  input: CancelPurchaseInput;
};


export type MutationCmsCreateArticleArgs = {
  input: CmsCreateArticleInput;
};


export type MutationCmsCreateFooterSectionArgs = {
  input: CmsCreateFooterSectionInput;
};


export type MutationCmsCreateProductArgs = {
  input: CmsCreateProductInput;
};


export type MutationCmsDeleteArticleArgs = {
  articleId: Scalars['String']['input'];
};


export type MutationCmsDeleteFileArgs = {
  imageId: Scalars['String']['input'];
};


export type MutationCmsDeleteFooterSectionArgs = {
  footerSectionId: Scalars['String']['input'];
};


export type MutationCmsDeleteProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCmsHideProductArgs = {
  hiddenReason: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};


export type MutationCmsLoginArgs = {
  input: LoginInput;
};


export type MutationCmsUnhideProductArgs = {
  productId: Scalars['String']['input'];
};


export type MutationCmsUpdateArticleArgs = {
  input: CmsUpdateArticleInput;
};


export type MutationCmsUpdateCategoryArgs = {
  input: CmsUpdateCategoryInput;
};


export type MutationCmsUpdateFooterSectionArgs = {
  input: CmsUpdateFooterSectionInput;
};


export type MutationCmsUpdateProductArgs = {
  input: CmsUpdateProductInput;
};


export type MutationCmsUploadFilesArgs = {
  input: CmsUploadFileInput;
};


export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};


export type MutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};


export type MutationCreatePayoutAccountArgs = {
  input: CreatePayoutAccountInput;
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


export type MutationDeleteDraftArgs = {
  input: RemoveProductInput;
};


export type MutationFinalizeUserArgs = {
  input: FinalizeUserInput;
};


export type MutationGetNewTokensArgs = {
  input: GetNewTokensInput;
};


export type MutationHideProductArgs = {
  input: HideProductInput;
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


export type MutationSelectPayoutMethodArgs = {
  input: SelectPayoutMethodInput;
};


export type MutationSetLikeProductArgs = {
  input: SetLikeProductInput;
};


export type MutationSetLikeProjectArgs = {
  input: SetLikeProjectInput;
};


export type MutationShowProductArgs = {
  input: ShowProductInput;
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

export type PaginatedProductsResponse = {
  __typename?: 'PaginatedProductsResponse';
  products: Array<Product>;
  total: Scalars['Int']['output'];
};

export enum PaymentMethod {
  Stripe = 'STRIPE',
  Swish = 'SWISH',
  Trustly = 'TRUSTLY'
}

export enum PaymentTypeEnum {
  Mobile = 'MOBILE',
  Web = 'WEB'
}

export enum PayoutAccountEnum {
  Bankgiro = 'BANKGIRO',
  Plusgiro = 'PLUSGIRO',
  Rix = 'RIX',
  Swish = 'SWISH',
  Trustly = 'TRUSTLY'
}

export type PayoutAccountResponse = {
  __typename?: 'PayoutAccountResponse';
  accountName?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  provider: PayoutAccountEnum;
};

export type PopularCategoriesInput = {
  limit: Scalars['Int']['input'];
};

export type Product = {
  __typename?: 'Product';
  address?: Maybe<Scalars['String']['output']>;
  approximatePlace?: Maybe<ApproximatePlaceResponse>;
  brand?: Maybe<Brand>;
  canDelete: Scalars['Boolean']['output'];
  category?: Maybe<Category>;
  condition: ProductConditionEnum;
  createdAt: Scalars['DateTime']['output'];
  deliveryEnabled: Scalars['Boolean']['output'];
  deliveryPrice?: Maybe<Scalars['Float']['output']>;
  deliveryRadius?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diameter?: Maybe<Scalars['Float']['output']>;
  diameterUnit: MeasurementUnitEnum;
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


export type ProductHasOngoingPurchaseArgs = {
  includeOwnPurchases?: InputMaybe<Scalars['Boolean']['input']>;
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
  title: Scalars['String']['output'];
  user: User;
};


export type ProjectProductsArgs = {
  searchString?: InputMaybe<Scalars['String']['input']>;
};

export type Purchase = {
  __typename?: 'Purchase';
  abortedById?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  boughtForFree: Scalars['Boolean']['output'];
  buyer: User;
  buyerId: Scalars['String']['output'];
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
  servicePointId?: InputMaybe<Scalars['String']['input']>;
  shippingProvider?: InputMaybe<ShippingProviderEnum>;
  successUrl?: InputMaybe<Scalars['String']['input']>;
  swishType?: InputMaybe<PaymentTypeEnum>;
  transportationMethod: TransportationEnum;
};

export type PurchaseProductResponse = {
  __typename?: 'PurchaseProductResponse';
  product: Product;
  purchase: Purchase;
  reference?: Maybe<Scalars['String']['output']>;
  swishToken?: Maybe<Scalars['String']['output']>;
  trustlyUrl?: Maybe<Scalars['String']['output']>;
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
  brand: Brand;
  brands: Array<Brand>;
  categories: Array<Category>;
  category: Category;
  cmsGetProduct: Product;
  cmsListImages: CmsListImagesResponse;
  cmsListProducts: CmsListProductsResponse;
  exactAndApproximatePlace: ExactAndApproximatePlaceResponse;
  footerSection: FooterSection;
  getAllShippingPrices: Array<ShippingPrice>;
  getCategories: Array<Category>;
  getConversation: Array<Message>;
  getConversations: Array<Message>;
  getDeliveryOption?: Maybe<DeliveryOptionResponse>;
  getDraftedProduct?: Maybe<Product>;
  getOrCreateDraftProduct: Product;
  getPickupOption?: Maybe<ApproximatePlaceResponse>;
  getProject: Project;
  getSearchResults: Array<SearchResult>;
  getShippingOptions: Array<ShippingOptionResponse>;
  getShippingPrice: ShippingPrice;
  getSimilarSearchResults: Array<SearchResult>;
  getUnreadConversationsCount: Scalars['Int']['output'];
  getUsers: Array<User>;
  latestPurchase?: Maybe<Purchase>;
  listArticles: ListArticlesResponse;
  listFooterSection: Array<FooterSection>;
  locationSearch: LocationSearchResponse;
  locationToAddress: GetAddressResponse;
  me: User;
  myProjects: Array<Project>;
  myPurchase?: Maybe<Purchase>;
  myPurchases: Array<Purchase>;
  nearbyServicePoints: Array<ServicePointResponse>;
  popularCategories: Array<Category>;
  product: Product;
  products: ProductsResponse;
  purchase: Purchase;
  rootCategories: Array<Category>;
  user: User;
  userExists?: Maybe<User>;
};


export type QueryAddressToLocationArgs = {
  input: AddressToLocationInput;
};


export type QueryArticleArgs = {
  id: Scalars['String']['input'];
};


export type QueryBrandArgs = {
  id: Scalars['String']['input'];
};


export type QueryCategoriesArgs = {
  input: CategoriesInput;
};


export type QueryCategoryArgs = {
  input: CategoryInput;
};


export type QueryCmsGetProductArgs = {
  productId: Scalars['String']['input'];
};


export type QueryCmsListImagesArgs = {
  input: CmsListImagesInput;
};


export type QueryCmsListProductsArgs = {
  input: CmsListProductsInput;
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


export type QueryGetUsersArgs = {
  input: GetUsersInput;
};


export type QueryLatestPurchaseArgs = {
  input: LatestPurchaseInput;
};


export type QueryListArticlesArgs = {
  input: ListArticlesInput;
};


export type QueryLocationSearchArgs = {
  input: LocationSearchInput;
};


export type QueryLocationToAddressArgs = {
  input: GetAddressInput;
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

export type SelectPayoutMethodInput = {
  method: PayoutAccountEnum;
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

export type ShowProductInput = {
  id: Scalars['String']['input'];
};

export enum TransportationEnum {
  Delivery = 'DELIVERY',
  Pickup = 'PICKUP',
  Shipping = 'SHIPPING'
}

export type UpdateProductInput = {
  addDocuments?: InputMaybe<Array<FileInputType>>;
  addImages?: InputMaybe<Array<FileInputType>>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
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
  likedProducts?: Maybe<ProductsResponse>;
  likedProjects?: Maybe<Array<Project>>;
  location?: Maybe<LocationResponse>;
  name?: Maybe<Scalars['String']['output']>;
  notifyOnMessage: Scalars['Boolean']['output'];
  notifyOnPurchaseUpdate: Scalars['Boolean']['output'];
  numberOfPublishedProducts: Scalars['Int']['output'];
  numberOfSoldProducts: Scalars['Int']['output'];
  organizationApprovedAt?: Maybe<Scalars['DateTime']['output']>;
  organizationNumber?: Maybe<Scalars['String']['output']>;
  payoutAccount?: Maybe<PayoutAccountResponse>;
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
  selectedPayoutMethod?: Maybe<PayoutAccountEnum>;
  type: UserType;
  username?: Maybe<Scalars['String']['output']>;
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

export type VerifyEmailInput = {
  email: Scalars['String']['input'];
  verifyEmailToken: Scalars['String']['input'];
};
