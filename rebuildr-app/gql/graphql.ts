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
  type: BrandTypeEnum;
};

export enum BrandTypeEnum {
  Other = 'OTHER',
  Regular = 'REGULAR'
}

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
  children: Array<Category>;
  image?: Maybe<File>;
  ancestorIds: Array<Scalars['String']['output']>;
  hasChildren: Scalars['Boolean']['output'];
  brands: Array<Brand>;
  parent?: Maybe<Category>;
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
  Discs = 'DISCS',
  Kg = 'KG'
}

export type Purchase = {
  __typename?: 'Purchase';
  id: Scalars['ID']['output'];
  paymentSentAt?: Maybe<Scalars['DateTime']['output']>;
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
};

export enum PurchaseStatusEnum {
  Claimed = 'CLAIMED',
  PaymentSent = 'PAYMENT_SENT',
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

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  address: Scalars['String']['output'];
  location: LocationResponse;
  approximatePlace: ApproximatePlaceResponse;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  id: Scalars['ID']['output'];
  searchString: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  username?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: UserRoleEnum;
  selectedPayoutMethod?: Maybe<PayoutAccountEnum>;
  type: UserType;
  organizationNumber?: Maybe<Scalars['String']['output']>;
  organizationApprovedAt?: Maybe<Scalars['DateTime']['output']>;
  profilePicture?: Maybe<File>;
  registrationStatus: RegisterStatusEnum;
  projects: Array<Project>;
  numberOfSoldProducts: Scalars['Int']['output'];
  numberOfPublishedProducts: Scalars['Int']['output'];
  rating?: Maybe<Scalars['Float']['output']>;
};

export enum UserRoleEnum {
  User = 'USER',
  Admin = 'ADMIN'
}

export enum PayoutAccountEnum {
  Swish = 'SWISH',
  Trustly = 'TRUSTLY',
  Rix = 'RIX',
  Bankgiro = 'BANKGIRO',
  Plusgiro = 'PLUSGIRO'
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

export type Message = {
  __typename?: 'Message';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  body: Scalars['String']['output'];
  senderId: Scalars['ID']['output'];
  receiverId: Scalars['ID']['output'];
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

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  address?: Maybe<Scalars['String']['output']>;
  hiddenReason?: Maybe<Scalars['String']['output']>;
  isGiveaway: Scalars['Boolean']['output'];
  primaryQuantity?: Maybe<Scalars['Float']['output']>;
  primaryUnit?: Maybe<QuantityUnitEnum>;
  secondaryQuantity?: Maybe<Scalars['Float']['output']>;
  secondaryUnit?: Maybe<QuantityUnitEnum>;
  /** Unit: millimeter */
  height?: Maybe<Scalars['Float']['output']>;
  /** Unit: millimeter */
  width?: Maybe<Scalars['Float']['output']>;
  /** Unit: millimeter */
  length?: Maybe<Scalars['Float']['output']>;
  /** Unit: millimeter */
  thickness?: Maybe<Scalars['Float']['output']>;
  /** Unit: millimeter */
  diameter?: Maybe<Scalars['Float']['output']>;
  /** Unit: kg */
  weight?: Maybe<Scalars['Float']['output']>;
  condition: ProductConditionEnum;
  status: ProductStatusEnum;
  distanceFromPosition?: Maybe<Scalars['Float']['output']>;
  pickupEnabled: Scalars['Boolean']['output'];
  deliveryEnabled: Scalars['Boolean']['output'];
  deliveryRadius?: Maybe<Scalars['Float']['output']>;
  category?: Maybe<Category>;
  seller: User;
  primaryImage?: Maybe<File>;
  images: Array<File>;
  documents: Array<File>;
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<LocationResponse>;
  price: Scalars['Float']['output'];
  brand?: Maybe<Brand>;
  project?: Maybe<Project>;
  approximatePlace?: Maybe<ApproximatePlaceResponse>;
  shippingPrices?: Maybe<Array<ShippingPrice>>;
  deliveryPrice?: Maybe<Scalars['Float']['output']>;
};

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
  Sold = 'SOLD'
}

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

export type ProductsResponse = {
  __typename?: 'ProductsResponse';
  products: Array<Product>;
  /** If address or location is supplied to Products(), this will have corresponding coordinates */
  origin?: Maybe<LocationResponse>;
  total: Scalars['Int']['output'];
};

export type ConversationResponse = {
  __typename?: 'ConversationResponse';
  otherUser: User;
  messages: Array<Message>;
};

export type ConversationOverviewResponse = {
  __typename?: 'ConversationOverviewResponse';
  otherUser: User;
  product: Product;
  latestMessageAt: Scalars['DateTime']['output'];
};

export type AuthenticateResponse = {
  __typename?: 'AuthenticateResponse';
  status: AuthResponseStatusEnum;
  qrCode?: Maybe<Scalars['String']['output']>;
  autoStartToken?: Maybe<Scalars['String']['output']>;
};

export enum AuthResponseStatusEnum {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Pending = 'PENDING'
}

export type CreatePayoutAccountResponse = {
  __typename?: 'CreatePayoutAccountResponse';
  user: User;
  trustlyUrl?: Maybe<Scalars['String']['output']>;
};

export type PurchaseProductResponse = {
  __typename?: 'PurchaseProductResponse';
  product: Product;
  purchase: Purchase;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  userExists?: Maybe<User>;
  getUsers: Array<User>;
  product: Product;
  products: ProductsResponse;
  getDraftedProduct?: Maybe<Product>;
  category: Category;
  categories: Array<Category>;
  rootCategories: Array<Category>;
  popularCategories: Array<Category>;
  conversation: ConversationResponse;
  conversations: Array<ConversationOverviewResponse>;
  locationToAddress: GetAddressResponse;
  locationSearch: LocationSearchResponse;
  addressToLocation: LocationResponse;
  brands: Array<Brand>;
  getProject: Project;
  myProjects: Array<Project>;
  getShippingPrice: ShippingPrice;
  getAllShippingPrices: Array<ShippingPrice>;
  getSearchResults: Array<SearchResult>;
  getSimilarSearchResults: Array<SearchResult>;
};


export type QueryUserExistsArgs = {
  input: UserExistsInput;
};


export type QueryGetUsersArgs = {
  input: GetUsersInput;
};


export type QueryProductArgs = {
  input: GetProductInput;
};


export type QueryProductsArgs = {
  input: ProductsInput;
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCategoryArgs = {
  input: CategoryInput;
};


export type QueryPopularCategoriesArgs = {
  input?: InputMaybe<PopularCategoriesInput>;
};


export type QueryConversationArgs = {
  input: ConversationInput;
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


export type QueryGetProjectArgs = {
  input: GetProjectInput;
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

export type UserExistsInput = {
  email: Scalars['String']['input'];
};

export type GetUsersInput = {
  name: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type GetProductInput = {
  id: Scalars['String']['input'];
};

export type ProductsInput = {
  searchString?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationType>;
  distance?: InputMaybe<Scalars['Float']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  selectionCategories?: InputMaybe<Scalars['Boolean']['input']>;
  seasonalCategories?: InputMaybe<Scalars['Boolean']['input']>;
  giveaway?: InputMaybe<Scalars['Boolean']['input']>;
  condition?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<OrderProductsEnum>;
};

export type LocationType = {
  longitude: Scalars['Float']['input'];
  latitude: Scalars['Float']['input'];
};

export enum OrderProductsEnum {
  Distance = 'DISTANCE',
  Latest = 'LATEST'
}

export type CategoryInput = {
  id: Scalars['String']['input'];
};

export type PopularCategoriesInput = {
  limit: Scalars['Int']['input'];
};

export type ConversationInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

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

export type GetProjectInput = {
  id: Scalars['String']['input'];
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

export type Mutation = {
  __typename?: 'Mutation';
  registerUser: User;
  verifyEmail: LoginResponse;
  resendVerificationMail: ResendVerificationMailResponse;
  finalizeUser: User;
  login: LoginResponse;
  getNewTokens: GetNewTokensResponse;
  resetPassword: ResetPasswordResponse;
  newPassword: LoginResponse;
  updateUser: User;
  createOrganizationUser: User;
  createProduct: CreateProductResponse;
  createDraftProduct: Product;
  updateProduct: UpdateProductResponse;
  hideProduct: Product;
  showProduct: Product;
  setLikeProduct: Product;
  updateCategory: Category;
  createMessage: Message;
  authenticateRocker: AuthenticateResponse;
  createPayoutAccount: CreatePayoutAccountResponse;
  purchaseProduct: PurchaseProductResponse;
  acceptPurchase: Purchase;
  createProject: Project;
  updateProject: Project;
  createSearchResult: SearchResult;
  clearSearchHistory: Scalars['Boolean']['output'];
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


export type MutationGetNewTokensArgs = {
  input: GetNewTokensInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationNewPasswordArgs = {
  input: NewPasswordInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationHideProductArgs = {
  input: HideProductInput;
};


export type MutationShowProductArgs = {
  input: ShowProductInput;
};


export type MutationSetLikeProductArgs = {
  input: SetLikeProductInput;
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};


export type MutationAuthenticateRockerArgs = {
  input: AuthenticateRockerInput;
};


export type MutationCreatePayoutAccountArgs = {
  input: CreatePayoutAccountInput;
};


export type MutationPurchaseProductArgs = {
  input: PurchaseProductInput;
};


export type MutationAcceptPurchaseArgs = {
  input: AcceptPurchaseInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationCreateSearchResultArgs = {
  input: CreateSearchResultInput;
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

export type UpdateUserInput = {
  id: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrganizationUserInput = {
  organizationNumber: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  creatorId: Scalars['String']['input'];
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

export type FileInputType = {
  mimeType: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  id: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInputType>;
  description?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  isGiveAway?: InputMaybe<Scalars['Boolean']['input']>;
  primaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  primaryUnit?: InputMaybe<QuantityUnitEnum>;
  secondaryQuantity?: InputMaybe<Scalars['Float']['input']>;
  secondaryUnit?: InputMaybe<QuantityUnitEnum>;
  height?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
  length?: InputMaybe<Scalars['Float']['input']>;
  thickness?: InputMaybe<Scalars['Float']['input']>;
  diameter?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  condition?: InputMaybe<ProductConditionEnum>;
  status?: InputMaybe<ProductStatusEnum>;
  addImages?: InputMaybe<Array<FileInputType>>;
  removeImages?: InputMaybe<Array<Scalars['String']['input']>>;
  addDocuments?: InputMaybe<Array<FileInputType>>;
  removeDocuments?: InputMaybe<Array<Scalars['String']['input']>>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  deliveryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  deliveryPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  pickupEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  shippingPriceIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type LocationInputType = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type HideProductInput = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type ShowProductInput = {
  id: Scalars['String']['input'];
};

export type SetLikeProductInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
};

export type UpdateCategoryInput = {
  id: Scalars['String']['input'];
  inSelection?: InputMaybe<Scalars['Boolean']['input']>;
  inSeason?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateMessageInput = {
  receiverId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  body: Scalars['String']['input'];
};

export type AuthenticateRockerInput = {
  requestId: Scalars['String']['input'];
};

export type CreatePayoutAccountInput = {
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  clearingNumber?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  accountName?: InputMaybe<Scalars['String']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  successUrl?: InputMaybe<Scalars['String']['input']>;
  failureUrl?: InputMaybe<Scalars['String']['input']>;
  type: PayoutAccountEnum;
};

export type PurchaseProductInput = {
  productId: Scalars['String']['input'];
  paymentMethod: PaymentMethod;
};

export enum PaymentMethod {
  Swish = 'SWISH',
  Stripe = 'STRIPE'
}

export type AcceptPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type CreateProjectInput = {
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  location: LocationInputType;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  id: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInputType>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSearchResultInput = {
  searchString: Scalars['String']['input'];
};

export type GetNewTokensMutationVariables = Exact<{
  input: GetNewTokensInput;
}>;


export type GetNewTokensMutation = { __typename?: 'Mutation', getNewTokens: { __typename?: 'GetNewTokensResponse', accessToken: string, refreshToken: string } };

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

export type CreateBusinessQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateBusinessQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string } };

export type CreateBusinessMutationVariables = Exact<{
  input: CreateOrganizationUserInput;
}>;


export type CreateBusinessMutation = { __typename?: 'Mutation', createOrganizationUser: { __typename?: 'User', id: string, username?: string | null, organizationNumber?: string | null } };

export type DetailsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type DetailsQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email?: string | null } };

export type UpdateDetailsFieldsMutationVariables = Exact<{
  input: FinalizeUserInput;
}>;


export type UpdateDetailsFieldsMutation = { __typename?: 'Mutation', finalizeUser: { __typename?: 'User', id: string, username?: string | null } };

export type VerifyEmailMutationVariables = Exact<{
  input: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: string } } };

export type CreateBankgiroPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateBankgiroPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreatePlusgiroPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreatePlusgiroPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

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

export type CreateTrustlyPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateTrustlyPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', trustlyUrl?: string | null, user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateRixPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateRixPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateSwishPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateSwishPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type PreviewProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type PreviewProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type EditProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type EditProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type UpdateProjectMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type PreviewPickupQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type PreviewPickupQueryQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type PickupQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type PickupQueryQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type UpdatePickupMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpdatePickupMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } } };

export type DeliveryQuerQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type DeliveryQuerQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type DeliveryUpdateMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type DeliveryUpdateMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, address?: string | null, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } } };

export type ShippingQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type ShippingQueryQuery = { __typename?: 'Query', getAllShippingPrices: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }>, product: { __typename?: 'Product', id: string, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } };

export type UpdateShippingMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpdateShippingMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } } };

export type AppQueryQueryVariables = Exact<{
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type AppQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, registrationStatus: RegisterStatusEnum } };

export type LandingQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type LandingQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, role: UserRoleEnum } };

export type AuthenticateRockerMutationVariables = Exact<{
  input: AuthenticateRockerInput;
}>;


export type AuthenticateRockerMutation = { __typename?: 'Mutation', authenticateRocker: { __typename?: 'AuthenticateResponse', status: AuthResponseStatusEnum, qrCode?: string | null, autoStartToken?: string | null } };

export type NewPasswordMutationVariables = Exact<{
  input: NewPasswordInput;
}>;


export type NewPasswordMutation = { __typename?: 'Mutation', newPassword: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string } };

export type SearchProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, brand?: { __typename?: 'Brand', id: string, name: string } | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> } };

export type SearchQueryVariables = Exact<{
  isLoggedIn: Scalars['Boolean']['input'];
  searchResult: GetSearchResultsInput;
}>;


export type SearchQuery = { __typename?: 'Query', popularCategories: Array<{ __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null }>, getSearchResults?: Array<{ __typename?: 'SearchResult', id: string, searchString: string, count: number }>, me?: { __typename?: 'User', id: string } };

export type DoSearchQueryVariables = Exact<{
  searchResultsInput: GetSimilarSearchResultsInput;
  usersInput: GetUsersInput;
}>;


export type DoSearchQuery = { __typename?: 'Query', getSimilarSearchResults: Array<{ __typename?: 'SearchResult', id: string, searchString: string, count: number }>, getUsers: Array<{ __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null }> };

export type ClearSearchHistoryMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearSearchHistoryMutation = { __typename?: 'Mutation', clearSearchHistory: boolean };

export type ProductDetailsFragmentFragment = { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null };

export type SellProductCreateDraftMutationVariables = Exact<{ [key: string]: never; }>;


export type SellProductCreateDraftMutation = { __typename?: 'Mutation', createDraftProduct: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } };

export type SellProductQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SellProductQueryQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } | null, me: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } };

export type SellProductUpdateMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type SellProductUpdateMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', imagePutUrls: Array<string>, documentPutUrls: Array<string>, product: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } } };

export type PreviewProductQueryVariables = Exact<{ [key: string]: never; }>;


export type PreviewProductQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string>, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } | null, me: { __typename?: 'User', id: string, address?: string | null } };

export type PublishProductMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type PublishProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, status: ProductStatusEnum } } };

export type ProjectGetMyProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProjectGetMyProjectsQuery = { __typename?: 'Query', myProjects: Array<{ __typename?: 'Project', id: string, title: string }>, getDraftedProduct?: { __typename?: 'Product', id: string, project?: { __typename?: 'Project', id: string } | null } | null };

export type ProjectGetProjectQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type ProjectGetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type ProjectUpdateProductMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type ProjectUpdateProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, project?: { __typename?: 'Project', id: string } | null } } };

export type RootPayoutMethodQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootPayoutMethodQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type TransportationQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TransportationQueryQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, deliveryEnabled: boolean, deliveryPrice?: number | null, deliveryRadius?: number | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } | null };

export type PayoutMethodQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type PayoutMethodQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export const ProductDetailsFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<ProductDetailsFragmentFragment, unknown>;
export const GetNewTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetNewTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNewTokensInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNewTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<GetNewTokensMutation, GetNewTokensMutationVariables>;
export const LocationSearchQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationSearchQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]}}]} as unknown as DocumentNode<LocationSearchQueryQuery, LocationSearchQueryQueryVariables>;
export const AddressToLocationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddressToLocationQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressToLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addressToLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]} as unknown as DocumentNode<AddressToLocationQueryQuery, AddressToLocationQueryQueryVariables>;
export const LocationToAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationToAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationToAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<LocationToAddressQuery, LocationToAddressQueryVariables>;
export const CategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionQuery, CategorySectionQueryVariables>;
export const CategorySectionSelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySectionSelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionSelectedCategoryQuery, CategorySectionSelectedCategoryQueryVariables>;
export const BrandSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<BrandSectionQuery, BrandSectionQueryVariables>;
export const RecommendedQuantitiesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedQuantitiesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantityUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantityUnit"}}]}}]}}]} as unknown as DocumentNode<RecommendedQuantitiesQueryQuery, RecommendedQuantitiesQueryQueryVariables>;
export const RootCategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]} as unknown as DocumentNode<RootCategorySectionQuery, RootCategorySectionQueryVariables>;
export const RootCategorySelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategorySelectedCategoryQuery, RootCategorySelectedCategoryQueryVariables>;
export const CreateBusinessQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateBusinessQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessQueryQuery, CreateBusinessQueryQueryVariables>;
export const CreateBusinessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBusiness"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganizationUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessMutation, CreateBusinessMutationVariables>;
export const DetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DetailsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<DetailsQueryQuery, DetailsQueryQueryVariables>;
export const UpdateDetailsFieldsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDetailsFields"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FinalizeUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<UpdateDetailsFieldsMutation, UpdateDetailsFieldsMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const CreateBankgiroPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBankgiroPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateBankgiroPayoutAccountMutation, CreateBankgiroPayoutAccountMutationVariables>;
export const CreatePlusgiroPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlusgiroPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlusgiroPayoutAccountMutation, CreatePlusgiroPayoutAccountMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UserExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserExistsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<UserExistsQuery, UserExistsQueryVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const CreateTrustlyPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTrustlyPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trustlyUrl"}}]}}]}}]} as unknown as DocumentNode<CreateTrustlyPayoutAccountMutation, CreateTrustlyPayoutAccountMutationVariables>;
export const CreateRixPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRixPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateRixPayoutAccountMutation, CreateRixPayoutAccountMutationVariables>;
export const CreateSwishPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSwishPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSwishPayoutAccountMutation, CreateSwishPayoutAccountMutationVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const PreviewProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewProjectQueryQuery, PreviewProjectQueryQueryVariables>;
export const EditProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EditProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<EditProjectQueryQuery, EditProjectQueryQueryVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const PreviewPickupQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewPickupQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PreviewPickupQueryQuery, PreviewPickupQueryQueryVariables>;
export const PickupQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickupQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PickupQueryQuery, PickupQueryQueryVariables>;
export const UpdatePickupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePickup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePickupMutation, UpdatePickupMutationVariables>;
export const DeliveryQuerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DeliveryQuer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeliveryQuerQuery, DeliveryQuerQueryVariables>;
export const DeliveryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeliveryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeliveryUpdateMutation, DeliveryUpdateMutationVariables>;
export const ShippingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShippingQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllShippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]} as unknown as DocumentNode<ShippingQueryQuery, ShippingQueryQueryVariables>;
export const UpdateShippingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateShipping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateShippingMutation, UpdateShippingMutationVariables>;
export const AppQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<AppQueryQuery, AppQueryQueryVariables>;
export const LandingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LandingQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<LandingQueryQuery, LandingQueryQueryVariables>;
export const AuthenticateRockerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthenticateRocker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticateRockerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateRocker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"qrCode"}},{"kind":"Field","name":{"kind":"Name","value":"autoStartToken"}}]}}]}}]} as unknown as DocumentNode<AuthenticateRockerMutation, AuthenticateRockerMutationVariables>;
export const NewPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NewPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<NewPasswordMutation, NewPasswordMutationVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSearchResultsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"popularCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const DoSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DoSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSimilarSearchResultsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSimilarSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<DoSearchQuery, DoSearchQueryVariables>;
export const ClearSearchHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearSearchHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearSearchHistory"}}]}}]} as unknown as DocumentNode<ClearSearchHistoryMutation, ClearSearchHistoryMutationVariables>;
export const SellProductCreateDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductCreateDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDraftProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductCreateDraftMutation, SellProductCreateDraftMutationVariables>;
export const SellProductQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SellProductQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductQueryQuery, SellProductQueryQueryVariables>;
export const SellProductUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imagePutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"documentPutUrls"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductUpdateMutation, SellProductUpdateMutationVariables>;
export const PreviewProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<PreviewProductQuery, PreviewProductQueryVariables>;
export const PublishProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PublishProductMutation, PublishProductMutationVariables>;
export const ProjectGetMyProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectGetMyProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectGetMyProjectsQuery, ProjectGetMyProjectsQueryVariables>;
export const ProjectGetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectGetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectGetProjectQuery, ProjectGetProjectQueryVariables>;
export const ProjectUpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProjectUpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProjectUpdateProductMutation, ProjectUpdateProductMutationVariables>;
export const RootPayoutMethodQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootPayoutMethodQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<RootPayoutMethodQueryQuery, RootPayoutMethodQueryQueryVariables>;
export const TransportationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransportationQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]} as unknown as DocumentNode<TransportationQueryQuery, TransportationQueryQueryVariables>;
export const PayoutMethodQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayoutMethodQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<PayoutMethodQueryQuery, PayoutMethodQueryQueryVariables>;