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
  registrationStatus: RegisterStatusEnum;
};

export enum UserRoleEnum {
  User = 'USER',
  Admin = 'ADMIN'
}

export enum PayoutAccountEnum {
  Swish = 'SWISH',
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
  category?: Maybe<Category>;
  seller: User;
  primaryImage?: Maybe<File>;
  images: Array<File>;
  documents: Array<File>;
  likedByUser?: Maybe<Scalars['Boolean']['output']>;
  location: LocationResponse;
  price: Scalars['Float']['output'];
  brand?: Maybe<Brand>;
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
  Published = 'PUBLISHED'
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

export type LocationResponse = {
  __typename?: 'LocationResponse';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
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

export type GetAddressResponse = {
  __typename?: 'GetAddressResponse';
  address: Scalars['String']['output'];
};

export type LocationSearchResponse = {
  __typename?: 'LocationSearchResponse';
  result: Array<Scalars['String']['output']>;
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

export type PurchaseProductResponse = {
  __typename?: 'PurchaseProductResponse';
  product: Product;
  purchase: Purchase;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  userExists?: Maybe<User>;
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
  brands: Array<Brand>;
};


export type QueryUserExistsArgs = {
  input: UserExistsInput;
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

export type UserExistsInput = {
  email: Scalars['String']['input'];
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
  createPayoutAccount: User;
  purchaseProduct: PurchaseProductResponse;
  acceptPurchase: Purchase;
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

export type GetNewTokensMutationVariables = Exact<{
  input: GetNewTokensInput;
}>;


export type GetNewTokensMutation = { __typename?: 'Mutation', getNewTokens: { __typename?: 'GetNewTokensResponse', accessToken: string, refreshToken: string } };

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

export type RootCategorySectionQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategorySectionQuery = { __typename?: 'Query', rootCategories: Array<{ __typename?: 'Category', id: string, name: string, description: string, orderIndex: number, image?: { __typename?: 'File', id: string, url: string } | null }> };

export type RootCategorySelectedCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type RootCategorySelectedCategoryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, name: string, description: string, image?: { __typename?: 'File', id: string, url: string } | null } };

export type RecommendedQuantitiesQueryQueryVariables = Exact<{
  input: CategoryInput;
}>;


export type RecommendedQuantitiesQueryQuery = { __typename?: 'Query', category: { __typename?: 'Category', id: string, primaryQuantityUnit?: QuantityUnitEnum | null, secondaryQuantityUnit?: QuantityUnitEnum | null } };

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

export type NewPasswordMutationVariables = Exact<{
  input: NewPasswordInput;
}>;


export type NewPasswordMutation = { __typename?: 'Mutation', newPassword: { __typename?: 'LoginResponse', accessToken: string, refreshToken: string } };

export type AppQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AppQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, registrationStatus: RegisterStatusEnum } };

export type SellProductQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SellProductQueryQuery = { __typename?: 'Query', getDraftedProduct?: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } | null };

export type SellProductUpdateMutationVariables = Exact<{
  input: UpdateProductInput;
}>;


export type SellProductUpdateMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'UpdateProductResponse', imagePutUrls: Array<string>, documentPutUrls: Array<string>, product: { __typename?: 'Product', id: string, title: string, description?: string | null, price: number, isGiveaway: boolean, condition: ProductConditionEnum, primaryQuantity?: number | null, primaryUnit?: QuantityUnitEnum | null, secondaryQuantity?: number | null, secondaryUnit?: QuantityUnitEnum | null, height?: number | null, width?: number | null, length?: number | null, thickness?: number | null, diameter?: number | null, weight?: number | null, images: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, documents: Array<{ __typename?: 'File', id: string, mimeType: string, url: string, name?: string | null }>, category?: { __typename?: 'Category', id: string, name: string, hasChildren: boolean, ancestorIds: Array<string> } | null, brand?: { __typename?: 'Brand', id: string, type: BrandTypeEnum } | null } } };

export type LandingQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type LandingQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username?: string | null, role: UserRoleEnum } };

export type CreateDraftMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateDraftMutation = { __typename?: 'Mutation', createDraftProduct: { __typename?: 'Product', id: string } };


export const GetNewTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetNewTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNewTokensInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNewTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<GetNewTokensMutation, GetNewTokensMutationVariables>;
export const BrandSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<BrandSectionQuery, BrandSectionQueryVariables>;
export const CategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionQuery, CategorySectionQueryVariables>;
export const CategorySectionSelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategorySectionSelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CategorySectionSelectedCategoryQuery, CategorySectionSelectedCategoryQueryVariables>;
export const RootCategorySectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]} as unknown as DocumentNode<RootCategorySectionQuery, RootCategorySectionQueryVariables>;
export const RootCategorySelectedCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategorySelectedCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategorySelectedCategoryQuery, RootCategorySelectedCategoryQueryVariables>;
export const RecommendedQuantitiesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedQuantitiesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantityUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantityUnit"}}]}}]}}]} as unknown as DocumentNode<RecommendedQuantitiesQueryQuery, RecommendedQuantitiesQueryQueryVariables>;
export const CreateBusinessQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateBusinessQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessQueryQuery, CreateBusinessQueryQueryVariables>;
export const CreateBusinessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBusiness"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganizationUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"organizationNumber"}}]}}]}}]} as unknown as DocumentNode<CreateBusinessMutation, CreateBusinessMutationVariables>;
export const DetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DetailsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<DetailsQueryQuery, DetailsQueryQueryVariables>;
export const UpdateDetailsFieldsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDetailsFields"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FinalizeUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<UpdateDetailsFieldsMutation, UpdateDetailsFieldsMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UserExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserExistsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<UserExistsQuery, UserExistsQueryVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const NewPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NewPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<NewPasswordMutation, NewPasswordMutationVariables>;
export const AppQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"registrationStatus"}}]}}]}}]} as unknown as DocumentNode<AppQueryQuery, AppQueryQueryVariables>;
export const SellProductQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SellProductQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDraftedProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<SellProductQueryQuery, SellProductQueryQueryVariables>;
export const SellProductUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SellProductUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isGiveaway"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"primaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"primaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryUnit"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"thickness"}},{"kind":"Field","name":{"kind":"Name","value":"diameter"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"hasChildren"}},{"kind":"Field","name":{"kind":"Name","value":"ancestorIds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"imagePutUrls"}},{"kind":"Field","name":{"kind":"Name","value":"documentPutUrls"}}]}}]}}]} as unknown as DocumentNode<SellProductUpdateMutation, SellProductUpdateMutationVariables>;
export const LandingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LandingQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<LandingQueryQuery, LandingQueryQueryVariables>;
export const CreateDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDraftProduct"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateDraftMutation, CreateDraftMutationVariables>;