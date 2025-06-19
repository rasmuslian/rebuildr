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

export type Purchase = {
  __typename?: 'Purchase';
  id: Scalars['ID']['output'];
  buyerId: Scalars['String']['output'];
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
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  isShipping: Scalars['Boolean']['output'];
  reviews: Array<Review>;
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
  likedByMe?: Maybe<Scalars['Boolean']['output']>;
  location: LocationResponse;
  approximatePlace: ApproximatePlaceResponse;
  products: Array<Product>;
  projectPicture?: Maybe<File>;
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
  name?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  postCode?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: UserRoleEnum;
  selectedPayoutMethod?: Maybe<PayoutAccountEnum>;
  type: UserType;
  organizationNumber?: Maybe<Scalars['String']['output']>;
  organizationApprovedAt?: Maybe<Scalars['DateTime']['output']>;
  notifyOnMessage: Scalars['Boolean']['output'];
  notifyOnBuy: Scalars['Boolean']['output'];
  notifyOnSale: Scalars['Boolean']['output'];
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
  payoutAccount?: Maybe<PayoutAccountResponse>;
};


export type UserLikedProductsArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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
  Boards = 'BOARDS',
  Kg = 'KG'
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
  product: Product;
  sender: User;
  receiver: User;
};

export enum MessageTypeEnum {
  User = 'USER',
  System = 'SYSTEM'
}

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
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
  canDelete: Scalars['Boolean']['output'];
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
  Sold = 'SOLD',
  Deleted = 'DELETED'
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

export type UpdateUserResponse = {
  __typename?: 'UpdateUserResponse';
  user: User;
  profilePicturePutUrl?: Maybe<Scalars['String']['output']>;
};

export type PayoutAccountResponse = {
  __typename?: 'PayoutAccountResponse';
  provider: PayoutAccountEnum;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  accountName?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
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
  user: User;
  getUsers: Array<User>;
  product: Product;
  products: ProductsResponse;
  getDraftedProduct?: Maybe<Product>;
  category: Category;
  categories: Array<Category>;
  getCategories: Array<Category>;
  rootCategories: Array<Category>;
  popularCategories: Array<Category>;
  getConversation: Array<Message>;
  getConversations: Array<Message>;
  locationToAddress: GetAddressResponse;
  locationSearch: LocationSearchResponse;
  addressToLocation: LocationResponse;
  latestPurchase?: Maybe<Purchase>;
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


export type QueryUserArgs = {
  input: GetUserInput;
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


export type QueryGetCategoriesArgs = {
  input: GetCategoriesInput;
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


export type QueryLocationToAddressArgs = {
  input: GetAddressInput;
};


export type QueryLocationSearchArgs = {
  input: LocationSearchInput;
};


export type QueryAddressToLocationArgs = {
  input: AddressToLocationInput;
};


export type QueryLatestPurchaseArgs = {
  input: LatestPurchaseInput;
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

export type GetUserInput = {
  id: Scalars['String']['input'];
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
  sellerId?: InputMaybe<Scalars['String']['input']>;
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
};

export type LocationInputType = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export enum OrderProductsEnum {
  Distance = 'DISTANCE',
  Latest = 'LATEST',
  Oldest = 'OLDEST',
  BestMatch = 'BEST_MATCH',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC'
}

export type CategoryInput = {
  id: Scalars['String']['input'];
};

export type GetCategoriesInput = {
  parentIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

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

export type LatestPurchaseInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
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
  updateUser: UpdateUserResponse;
  createOrganizationUser: User;
  deleteAccount: User;
  createProduct: CreateProductResponse;
  createDraftProduct: Product;
  updateProduct: UpdateProductResponse;
  hideProduct: Product;
  showProduct: Product;
  setLikeProduct: Product;
  updateCategory: Category;
  createMessage: Message;
  markConversationAsRead: Array<Message>;
  authenticateRocker: AuthenticateResponse;
  createPayoutAccount: CreatePayoutAccountResponse;
  selectPayoutMethod: User;
  purchaseProduct: PurchaseProductResponse;
  acceptPurchase: Purchase;
  markPurchaseAsDelivered: Purchase;
  createProject: Project;
  updateProject: Project;
  setLikeProject: Project;
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


export type MutationMarkConversationAsReadArgs = {
  input: MarkAsReadInput;
};


export type MutationAuthenticateRockerArgs = {
  input: AuthenticateRockerInput;
};


export type MutationCreatePayoutAccountArgs = {
  input: CreatePayoutAccountInput;
};


export type MutationSelectPayoutMethodArgs = {
  input: SelectPayoutMethodInput;
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
  notifyOnBuy?: InputMaybe<Scalars['Boolean']['input']>;
  notifyOnSale?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FileInputType = {
  mimeType: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
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
  message: Scalars['String']['input'];
};

export type MarkAsReadInput = {
  otherUserId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  markAsRead: Scalars['Boolean']['input'];
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

export type SelectPayoutMethodInput = {
  method: PayoutAccountEnum;
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

export type MarkPurchaseAsDeliveredInput = {
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

export type SetLikeProjectInput = {
  id: Scalars['String']['input'];
  like: Scalars['Boolean']['input'];
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

export type ProjectLikeMutationVariables = Exact<{
  input: SetLikeProjectInput;
}>;


export type ProjectLikeMutation = { __typename?: 'Mutation', setLikeProject: { __typename?: 'Project', id: string, likedByMe?: boolean | null } };

export type BrandSectionQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type BrandSectionQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum }>, category: { __typename?: 'Category', id: string, brands: Array<{ __typename?: 'Brand', id: string, name: string }> } };

export type CategorySectionQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type CategorySectionQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, children: Array<{ __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null }> } };

export type CategorySectionSelectedCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type CategorySectionSelectedCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, image?: { __typename?: 'File', id: string, url: string } | null } };

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

export type BrandFilterQueryVariables = Exact<{ [key: string]: never; }>;


export type BrandFilterQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum }> };

export type CategoryFilterQueryVariables = Exact<{
  input: GetCategoriesInput;
}>;


export type CategoryFilterQuery = { __typename?: 'Query', getCategories: Array<{ __typename?: 'Category', id: string, name: string }> };

export type RootCategoryFilterQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategoryFilterQuery = { __typename?: 'Query', rootCategories: Array<{ __typename?: 'Category', id: string, name: string }> };

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

export type VerifyAuthenticateRockerMutationVariables = Exact<{
  input: AuthenticateRockerInput;
}>;


export type VerifyAuthenticateRockerMutation = { __typename?: 'Mutation', authenticateRocker: { __typename?: 'AuthenticateResponse', status: AuthResponseStatusEnum, qrCode?: string | null, autoStartToken?: string | null } };

export type PayoutMethodQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type PayoutMethodQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type CreateProjectQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateProjectQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, address?: string | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null } };

export type CreateProjectMutationMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutationMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type EditProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type EditProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number } } };

export type UpdateProjectMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type PreviewProjectQueryQueryVariables = Exact<{
  input: GetProjectInput;
}>;


export type PreviewProjectQueryQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, title: string, description?: string | null, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } };

export type DeliveryQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type DeliveryQueryQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type DeliveryUpdateMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type DeliveryUpdateMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, address?: string | null, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } } };

export type PickupQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type PickupQueryQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type UpdatePickupMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpdatePickupMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } } };

export type PreviewPickupQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type PreviewPickupQueryQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, address?: string | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null } };

export type ShippingQueryQueryVariables = Exact<{
  input: GetProductInput;
}>;


export type ShippingQueryQuery = { __typename?: 'Query', getAllShippingPrices: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }>, product: { __typename?: 'Product', id: string, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } };

export type UpdateShippingMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type UpdateShippingMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } } };

export type CreatePlusgiroPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreatePlusgiroPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateTrustlyPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateTrustlyPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', trustlyUrl?: string | null, user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type SelectTrustlyPayoutMethodMutationVariables = Exact<{
  input: SelectPayoutMethodInput;
}>;


export type SelectTrustlyPayoutMethodMutation = { __typename?: 'Mutation', selectPayoutMethod: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } };

export type CreateSwishPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateSwishPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateRixPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateRixPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type CreateBankgiroPayoutAccountMutationVariables = Exact<{
  input: CreatePayoutAccountInput;
}>;


export type CreateBankgiroPayoutAccountMutation = { __typename?: 'Mutation', createPayoutAccount: { __typename?: 'CreatePayoutAccountResponse', user: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } } };

export type AppQueryQueryVariables = Exact<{
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type AppQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, registrationStatus: RegisterStatusEnum } };

export type NewPasswordMutationVariables = Exact<{
  input: NewPasswordInput;
}>;


export type NewPasswordMutation = { __typename?: 'Mutation', newPassword: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string } };

export type LandingQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type LandingQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, role: UserRoleEnum } };

export type AuthenticateRockerMutationVariables = Exact<{
  input: AuthenticateRockerInput;
}>;


export type AuthenticateRockerMutation = { __typename?: 'Mutation', authenticateRocker: { __typename?: 'AuthenticateResponse', status: AuthResponseStatusEnum, qrCode?: string | null, autoStartToken?: string | null } };

export type ProductViewQueryVariables = Exact<{
  input: GetProductInput;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type ProductViewQuery = { __typename?: 'Query', product: { __typename?: 'Product', id: string, createdAt: any, updatedAt: any, canDelete: boolean, likedByMe?: boolean | null, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string>, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, projectPicture?: { __typename?: 'File', id: string, url: string } | null, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string }, products: Array<{ __typename?: 'Product', id: string, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null, seller: { __typename?: 'User', id: string, type: UserType, username?: string | null, rating?: number | null, numberOfPublishedProducts: number, numberOfSoldProducts: number, profilePicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, title: string, likedByMe?: boolean | null, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> } }, me?: { __typename?: 'User', id: string, address?: string | null } };

export type ProductViewLikeProductMutationVariables = Exact<{
  input: SetLikeProductInput;
}>;


export type ProductViewLikeProductMutation = { __typename?: 'Mutation', setLikeProduct: { __typename?: 'Product', id: string, likedByMe?: boolean | null } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, type: UserType, numberOfSoldProducts: number, numberOfPublishedProducts: number, rating?: number | null, likedProducts?: { __typename?: 'ProductsResponse', total: number } | null, sales: Array<{ __typename?: 'Purchase', id: string }>, purchases: Array<{ __typename?: 'Purchase', id: string }>, profilePicture?: { __typename?: 'File', id: string, url: string } | null } };

export type ProfileQueryVariables = Exact<{
  input: GetUserInput;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type ProfileQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, username?: string | null, description?: string | null, type: UserType, numberOfSoldProducts: number, numberOfPublishedProducts: number, rating?: number | null, products: Array<{ __typename?: 'Product', id: string, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }>, projects: Array<{ __typename?: 'Project', id: string, title: string, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> }>, profilePicture?: { __typename?: 'File', id: string, url: string } | null, reviewed: Array<{ __typename?: 'Review', id: string, createdAt: any, review: string, stars: number, purchase: { __typename?: 'Purchase', id: string, buyerId: string }, reviewer: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }> }, me?: { __typename?: 'User', id: string } };

export type ProfileProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProfileProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }> } };

export type ProfileUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type ProfileUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', profilePicturePutUrl?: string | null, user: { __typename?: 'User', id: string, description?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } };

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

export type CreateSearchResultMutationVariables = Exact<{
  input: CreateSearchResultInput;
}>;


export type CreateSearchResultMutation = { __typename?: 'Mutation', createSearchResult: { __typename?: 'SearchResult', id: string, searchString: string, count: number } };

export type GetConversationsQueryVariables = Exact<{
  input: GetConversationsInput;
}>;


export type GetConversationsQuery = { __typename?: 'Query', getConversations: Array<{ __typename?: 'Message', id: string, message: string, readAt?: any | null, createdAt: any, sender: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, product: { __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, seller: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } }>, me: { __typename?: 'User', id: string } };

export type ProductDetailsFragmentFragment = { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null };

export type SellProductCreateDraftMutationVariables = Exact<{ [key: string]: never; }>;


export type SellProductCreateDraftMutation = { __typename?: 'Mutation', createDraftProduct: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } };

export type SellProductQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SellProductQueryQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } | null, me: { __typename?: 'User', id: string, selectedPayoutMethod?: PayoutAccountEnum | null } };

export type SellProductUpdateMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type SellProductUpdateMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', imagePutUrls: Array<string>, documentPutUrls: Array<string>, product: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } } };

export type PreviewDraftedProductQueryVariables = Exact<{ [key: string]: never; }>;


export type PreviewDraftedProductQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, pickupEnabled: boolean, deliveryRadius?: number | null, deliveryPrice?: number | null, deliveryEnabled: boolean, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, parent?: { __typename?: 'Category', id: string, name: string } | null } | null, brand?: { __typename?: 'Brand', id: string, name: string, type: BrandTypeEnum } | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } | null, me: { __typename?: 'User', id: string, address?: string | null } };

export type PublishProductMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type PublishProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', product: { __typename?: 'Product', id: string, status: ProductStatusEnum } } };

export type SearchProductsQueryVariables = Exact<{
  input: ProductsInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn: Scalars['Boolean']['input'];
}>;


export type SearchProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, price: number, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, likedByMe?: boolean | null, brand?: { __typename?: 'Brand', id: string, name: string } | null, primaryImage?: { __typename?: 'File', id: string, url: string } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null } }> }, me?: { __typename?: 'User', id: string, address?: string | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null } };

export type MyFavoritesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyFavoritesQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, likedProducts?: { __typename?: 'ProductsResponse', total: number, products: Array<{ __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, condition: ProductConditionEnum, likedByMe?: boolean | null, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null, seller: { __typename?: 'User', id: string, type: UserType, rating?: number | null }, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', address: string } | null }> } | null, likedProjects?: Array<{ __typename?: 'Project', id: string, title: string, likedByMe?: boolean | null, projectPicture?: { __typename?: 'File', id: string, url: string } | null, products: Array<{ __typename?: 'Product', id: string, primaryImage?: { __typename?: 'File', id: string, url: string } | null }> }> | null } };

export type TransportationQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TransportationQueryQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, address?: string | null, pickupEnabled: boolean, deliveryEnabled: boolean, deliveryPrice?: number | null, deliveryRadius?: number | null, location?: { __typename?: 'LocationResponse', lat: number, lng: number } | null, approximatePlace?: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } | null, project?: { __typename?: 'Project', id: string, title: string, address: string, location: { __typename?: 'LocationResponse', lat: number, lng: number }, approximatePlace: { __typename?: 'ApproximatePlaceResponse', lat: number, lng: number, address: string } } | null, shippingPrices?: Array<{ __typename?: 'ShippingPrice', id: string, maxWeight: number, price: number, provider: ShippingProviderEnum }> | null } | null };

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

export type ConversationsQueryVariables = Exact<{
  input: GetConversationsInput;
}>;


export type ConversationsQuery = { __typename?: 'Query', getConversations: Array<{ __typename?: 'Message', id: string, message: string, readAt?: any | null, createdAt: any, sender: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, type: UserType, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, product: { __typename?: 'Product', id: string, title: string, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, condition: ProductConditionEnum, price: number, primaryImage?: { __typename?: 'File', id: string, url: string } | null } }>, me: { __typename?: 'User', id: string } };

export type RootPayoutMethodQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type RootPayoutMethodQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type AccountSettingsNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsNotificationsQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email?: string | null, notifyOnMessage: boolean, notifyOnBuy: boolean, notifyOnSale: boolean } };

export type AccountSettingsUpdateNotificationsMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type AccountSettingsUpdateNotificationsMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, notifyOnMessage: boolean, notifyOnBuy: boolean, notifyOnSale: boolean } } };

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMutation = { __typename?: 'Mutation', deleteAccount: { __typename?: 'User', id: string } };

export type AccountSettingsPayoutQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsPayoutQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType, payoutAccount?: { __typename?: 'PayoutAccountResponse', provider: PayoutAccountEnum, accountName?: string | null, bankName?: string | null, phoneNumber?: string | null } | null } };

export type AccountSettingsLayoutPayoutQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsLayoutPayoutQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, type: UserType } };

export type AccountSettingsUserFragmentFragment = { __typename?: 'User', id: string, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null };

export type AccountSettingsUserQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountSettingsUserQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null } };

export type AccountSettingsUpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type AccountSettingsUpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UpdateUserResponse', user: { __typename?: 'User', id: string, email?: string | null, username?: string | null, phoneNumber?: string | null, name?: string | null, address?: string | null, postCode?: string | null, city?: string | null } } };

export type ConversationProductQueryVariables = Exact<{
  input: GetConversationInput;
  getProductInput: GetProductInput;
  latestPurchaseInput: LatestPurchaseInput;
}>;


export type ConversationProductQuery = { __typename?: 'Query', getConversation: Array<{ __typename?: 'Message', id: string, message: string, messageType: MessageTypeEnum, createdAt: any, sender: { __typename?: 'User', id: string, type: UserType, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } }>, product: { __typename?: 'Product', id: string, title: string, price: number, seller: { __typename?: 'User', id: string, username?: string | null }, primaryImage?: { __typename?: 'File', id: string, url: string } | null }, latestPurchase?: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, paymentAcceptedAt?: any | null, shipmentBookedAt?: any | null, shipmentDeliveredAt?: any | null, deliveredAt?: any | null, failedAt?: any | null, approvedAt?: any | null, qrCodeUrl?: string | null, isShipping: boolean, reviews: Array<{ __typename?: 'Review', id: string, reviewerId: string, revieweeId: string }> } | null, me: { __typename?: 'User', id: string, username?: string | null } };

export type CreateMessageMutationVariables = Exact<{
  input: CreateMessageInput;
}>;


export type CreateMessageMutation = { __typename?: 'Mutation', createMessage: { __typename?: 'Message', id: string, message: string, messageType: MessageTypeEnum, createdAt: any, sender: { __typename?: 'User', id: string, type: UserType, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null }, receiver: { __typename?: 'User', id: string, username?: string | null, profilePicture?: { __typename?: 'File', id: string, url: string } | null } } };

export type MarkConversationAsReadMutationVariables = Exact<{
  input: MarkAsReadInput;
}>;


export type MarkConversationAsReadMutation = { __typename?: 'Mutation', markConversationAsRead: Array<{ __typename?: 'Message', id: string, readAt?: any | null }> };

export type ConversationAcceptPurchaseMutationVariables = Exact<{
  input: AcceptPurchaseInput;
}>;


export type ConversationAcceptPurchaseMutation = { __typename?: 'Mutation', acceptPurchase: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, approvedAt?: any | null } };

export type ConversationMarkAsDeliveredMutationVariables = Exact<{
  input: MarkPurchaseAsDeliveredInput;
}>;


export type ConversationMarkAsDeliveredMutation = { __typename?: 'Mutation', markPurchaseAsDelivered: { __typename?: 'Purchase', id: string, status: PurchaseStatusEnum, deliveredAt?: any | null } };

export const ProductDetailsFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<ProductDetailsFragmentFragment, unknown>;
export const AccountSettingsUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]} as unknown as DocumentNode<AccountSettingsUserFragmentFragment, unknown>;
export const GetNewTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetNewTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNewTokensInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNewTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<GetNewTokensMutation, GetNewTokensMutationVariables>;
export const LocationSearchQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationSearchQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]}}]} as unknown as DocumentNode<LocationSearchQueryQuery, LocationSearchQueryQueryVariables>;
export const AddressToLocationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddressToLocationQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressToLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addressToLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]} as unknown as DocumentNode<AddressToLocationQueryQuery, AddressToLocationQueryQueryVariables>;
export const LocationToAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationToAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationToAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<LocationToAddressQuery, LocationToAddressQueryVariables>;
export const ProjectLikeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProjectLike"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLikeProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLikeProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}}]}}]}}]} as unknown as DocumentNode<ProjectLikeMutation, ProjectLikeMutationVariables>;
export const BrandSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<BrandSectionQuery, BrandSectionQueryVariables>;
export const CategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionQuery, CategorySectionQueryVariables>;
export const CategorySectionSelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySectionSelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionSelectedCategoryQuery, CategorySectionSelectedCategoryQueryVariables>;
export const RecommendedQuantitiesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedQuantitiesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantityUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantityUnit"}}]}}]}}]} as unknown as DocumentNode<RecommendedQuantitiesQueryQuery, RecommendedQuantitiesQueryQueryVariables>;
export const RootCategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]} as unknown as DocumentNode<RootCategorySectionQuery, RootCategorySectionQueryVariables>;
export const RootCategorySelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategorySelectedCategoryQuery, RootCategorySelectedCategoryQueryVariables>;
export const BrandFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandFilter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<BrandFilterQuery, BrandFilterQueryVariables>;
export const CategoryFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryFilter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetCategoriesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CategoryFilterQuery, CategoryFilterQueryVariables>;
export const RootCategoryFilterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategoryFilter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RootCategoryFilterQuery, RootCategoryFilterQueryVariables>;
export const CreateBusinessQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateBusinessQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessQueryQuery, CreateBusinessQueryQueryVariables>;
export const CreateBusinessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBusiness"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganizationUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessMutation, CreateBusinessMutationVariables>;
export const DetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DetailsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<DetailsQueryQuery, DetailsQueryQueryVariables>;
export const UpdateDetailsFieldsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDetailsFields"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FinalizeUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<UpdateDetailsFieldsMutation, UpdateDetailsFieldsMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationMailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerificationMail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ResendVerificationMailMutation, ResendVerificationMailMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UserExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserExistsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<UserExistsQuery, UserExistsQueryVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const VerifyAuthenticateRockerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyAuthenticateRocker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticateRockerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateRocker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"qrCode"}},{"kind":"Field","name":{"kind":"Name","value":"autoStartToken"}}]}}]}}]} as unknown as DocumentNode<VerifyAuthenticateRockerMutation, VerifyAuthenticateRockerMutationVariables>;
export const PayoutMethodQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayoutMethodQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<PayoutMethodQueryQuery, PayoutMethodQueryQueryVariables>;
export const CreateProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateProjectQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectQueryQuery, CreateProjectQueryQueryVariables>;
export const CreateProjectMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutationMutation, CreateProjectMutationMutationVariables>;
export const EditProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EditProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<EditProjectQueryQuery, EditProjectQueryQueryVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const PreviewProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewProjectQueryQuery, PreviewProjectQueryQueryVariables>;
export const DeliveryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DeliveryQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeliveryQueryQuery, DeliveryQueryQueryVariables>;
export const DeliveryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeliveryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeliveryUpdateMutation, DeliveryUpdateMutationVariables>;
export const PickupQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickupQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PickupQueryQuery, PickupQueryQueryVariables>;
export const UpdatePickupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePickup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePickupMutation, UpdatePickupMutationVariables>;
export const PreviewPickupQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewPickupQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PreviewPickupQueryQuery, PreviewPickupQueryQueryVariables>;
export const ShippingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShippingQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllShippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]} as unknown as DocumentNode<ShippingQueryQuery, ShippingQueryQueryVariables>;
export const UpdateShippingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateShipping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateShippingMutation, UpdateShippingMutationVariables>;
export const CreatePlusgiroPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlusgiroPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlusgiroPayoutAccountMutation, CreatePlusgiroPayoutAccountMutationVariables>;
export const CreateTrustlyPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTrustlyPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trustlyUrl"}}]}}]}}]} as unknown as DocumentNode<CreateTrustlyPayoutAccountMutation, CreateTrustlyPayoutAccountMutationVariables>;
export const SelectTrustlyPayoutMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SelectTrustlyPayoutMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SelectPayoutMethodInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectPayoutMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]} as unknown as DocumentNode<SelectTrustlyPayoutMethodMutation, SelectTrustlyPayoutMethodMutationVariables>;
export const CreateSwishPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSwishPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSwishPayoutAccountMutation, CreateSwishPayoutAccountMutationVariables>;
export const CreateRixPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRixPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateRixPayoutAccountMutation, CreateRixPayoutAccountMutationVariables>;
export const CreateBankgiroPayoutAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBankgiroPayoutAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayoutAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}}]}}]} as unknown as DocumentNode<CreateBankgiroPayoutAccountMutation, CreateBankgiroPayoutAccountMutationVariables>;
export const AppQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<AppQueryQuery, AppQueryQueryVariables>;
export const NewPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NewPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<NewPasswordMutation, NewPasswordMutationVariables>;
export const LandingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LandingQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<LandingQueryQuery, LandingQueryQueryVariables>;
export const AuthenticateRockerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthenticateRocker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthenticateRockerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateRocker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"qrCode"}},{"kind":"Field","name":{"kind":"Name","value":"autoStartToken"}}]}}]}}]} as unknown as DocumentNode<AuthenticateRockerMutation, AuthenticateRockerMutationVariables>;
export const ProductViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<ProductViewQuery, ProductViewQueryVariables>;
export const ProductViewLikeProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProductViewLikeProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetLikeProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLikeProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}}]}}]}}]} as unknown as DocumentNode<ProductViewLikeProductMutation, ProductViewLikeProductMutationVariables>;
export const MyAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"likedProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<MyAccountQuery, MyAccountQueryVariables>;
export const ProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Profile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviewed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"review"}},{"kind":"Field","name":{"kind":"Name","value":"stars"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyerId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ProfileQuery, ProfileQueryVariables>;
export const ProfileProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProfileProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<ProfileProductsQuery, ProfileProductsQueryVariables>;
export const ProfileUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProfileUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"profilePicturePutUrl"}}]}}]}}]} as unknown as DocumentNode<ProfileUpdateUserMutation, ProfileUpdateUserMutationVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSearchResultsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"popularCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResult"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const DoSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DoSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSimilarSearchResultsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUsersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSimilarSearchResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchResultsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"usersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfPublishedProducts"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfSoldProducts"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<DoSearchQuery, DoSearchQueryVariables>;
export const ClearSearchHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearSearchHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearSearchHistory"}}]}}]} as unknown as DocumentNode<ClearSearchHistoryMutation, ClearSearchHistoryMutationVariables>;
export const CreateSearchResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSearchResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSearchResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSearchResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"searchString"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<CreateSearchResultMutation, CreateSearchResultMutationVariables>;
export const GetConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getConversations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetConversationsQuery, GetConversationsQueryVariables>;
export const SellProductCreateDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductCreateDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDraftProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductCreateDraftMutation, SellProductCreateDraftMutationVariables>;
export const SellProductQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SellProductQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"selectedPayoutMethod"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductQueryQuery, SellProductQueryQueryVariables>;
export const SellProductUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailsFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imagePutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"documentPutUrls"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SellProductUpdateMutation, SellProductUpdateMutationVariables>;
export const PreviewDraftedProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<PreviewDraftedProductQuery, PreviewDraftedProductQueryVariables>;
export const PublishProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PublishProductMutation, PublishProductMutationVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLoggedIn"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const MyFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"likedProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"projectPicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"likedByMe"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyFavoritesQuery, MyFavoritesQueryVariables>;
export const TransportationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransportationQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"pickupEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryPrice"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryRadius"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approximatePlace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}}]}}]}}]} as unknown as DocumentNode<TransportationQueryQuery, TransportationQueryQueryVariables>;
export const ProjectGetMyProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectGetMyProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectGetMyProjectsQuery, ProjectGetMyProjectsQueryVariables>;
export const ProjectGetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectGetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectGetProjectQuery, ProjectGetProjectQueryVariables>;
export const ProjectUpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProjectUpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProjectUpdateProductMutation, ProjectUpdateProductMutationVariables>;
export const ConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"conversations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ConversationsQuery, ConversationsQueryVariables>;
export const RootPayoutMethodQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootPayoutMethodQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<RootPayoutMethodQueryQuery, RootPayoutMethodQueryQueryVariables>;
export const AccountSettingsNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnMessage"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnBuy"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnSale"}}]}}]}}]} as unknown as DocumentNode<AccountSettingsNotificationsQuery, AccountSettingsNotificationsQueryVariables>;
export const AccountSettingsUpdateNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountSettingsUpdateNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnMessage"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnBuy"}},{"kind":"Field","name":{"kind":"Name","value":"notifyOnSale"}}]}}]}}]}}]} as unknown as DocumentNode<AccountSettingsUpdateNotificationsMutation, AccountSettingsUpdateNotificationsMutationVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const AccountSettingsPayoutQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsPayoutQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"payoutAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}}]}}]}}]}}]} as unknown as DocumentNode<AccountSettingsPayoutQueryQuery, AccountSettingsPayoutQueryQueryVariables>;
export const AccountSettingsLayoutPayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsLayoutPayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<AccountSettingsLayoutPayoutQuery, AccountSettingsLayoutPayoutQueryVariables>;
export const AccountSettingsUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountSettingsUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountSettingsUserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]} as unknown as DocumentNode<AccountSettingsUserQuery, AccountSettingsUserQueryVariables>;
export const AccountSettingsUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountSettingsUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountSettingsUserFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountSettingsUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"postCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}}]} as unknown as DocumentNode<AccountSettingsUpdateUserMutation, AccountSettingsUpdateUserMutationVariables>;
export const ConversationProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConversationProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetConversationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"getProductInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latestPurchaseInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LatestPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"messageType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"getProductInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latestPurchaseInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentAcceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentBookedAt"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentDeliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"failedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isShipping"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviewerId"}},{"kind":"Field","name":{"kind":"Name","value":"revieweeId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<ConversationProductQuery, ConversationProductQueryVariables>;
export const CreateMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"messageType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"receiver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"profilePicture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateMessageMutation, CreateMessageMutationVariables>;
export const MarkConversationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkConversationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkAsReadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markConversationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkConversationAsReadMutation, MarkConversationAsReadMutationVariables>;
export const ConversationAcceptPurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConversationAcceptPurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptPurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptPurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}}]}}]}}]} as unknown as DocumentNode<ConversationAcceptPurchaseMutation, ConversationAcceptPurchaseMutationVariables>;
export const ConversationMarkAsDeliveredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConversationMarkAsDelivered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkPurchaseAsDeliveredInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPurchaseAsDelivered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}}]}}]}}]} as unknown as DocumentNode<ConversationMarkAsDeliveredMutation, ConversationMarkAsDeliveredMutationVariables>;