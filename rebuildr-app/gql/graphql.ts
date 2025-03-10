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
  presignedGetUrl: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  inSelection: Scalars['Boolean']['output'];
  inSeason: Scalars['Boolean']['output'];
  icon?: Maybe<CategoryIconEnum>;
  children: Array<Category>;
  image?: Maybe<File>;
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

export type Purchase = {
  __typename?: 'Purchase';
  id: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
  email: Scalars['String']['output'];
  address?: Maybe<Scalars['String']['output']>;
  role: UserRoleEnum;
};

export enum UserRoleEnum {
  User = 'USER',
  Admin = 'ADMIN'
}

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  price: Scalars['Int']['output'];
  address: Scalars['String']['output'];
  hiddenReason?: Maybe<Scalars['String']['output']>;
  isGiveaway: Scalars['Boolean']['output'];
  brand?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Int']['output']>;
  /** Unit: millimeter */
  height?: Maybe<Scalars['Int']['output']>;
  /** Unit: millimeter */
  width?: Maybe<Scalars['Int']['output']>;
  /** Unit: millimeter */
  depth?: Maybe<Scalars['Int']['output']>;
  /** Unit: liter */
  volume?: Maybe<Scalars['Int']['output']>;
  condition: ProductConditionEnum;
  description?: Maybe<Scalars['String']['output']>;
  distanceFromPosition?: Maybe<Scalars['Float']['output']>;
  category: Category;
  user: User;
  images: Array<File>;
  mainImage?: Maybe<File>;
  likedByUser?: Maybe<Scalars['Boolean']['output']>;
  location: LocationResponse;
};

export enum ProductConditionEnum {
  New = 'NEW',
  VeryGood = 'VERY_GOOD',
  Good = 'GOOD',
  Okay = 'OKAY',
  Bad = 'BAD'
}

export type RegisterUserResponse = {
  __typename?: 'RegisterUserResponse';
  message: Scalars['String']['output'];
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

export type Message = {
  __typename?: 'Message';
  id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  body: Scalars['String']['output'];
  senderId: Scalars['ID']['output'];
  receiverId: Scalars['ID']['output'];
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

export type ProductsResponse = {
  __typename?: 'ProductsResponse';
  products: Array<Product>;
  /** If address or location is supplied to Products(), this will have corresponding coordinates */
  origin?: Maybe<LocationResponse>;
  total: Scalars['Int']['output'];
};

export type DeleteProductResponse = {
  __typename?: 'DeleteProductResponse';
  title: Scalars['String']['output'];
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
  product: Product;
  products: ProductsResponse;
  category: Category;
  categories: Array<Category>;
  rootCategories: Array<Category>;
  popularCategories: Array<Category>;
  conversation: ConversationResponse;
  conversations: Array<ConversationOverviewResponse>;
  locationToAddress: GetAddressResponse;
  locationSearch: LocationSearchResponse;
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
  registerUser: RegisterUserResponse;
  verifyMail: LoginResponse;
  resendVerificationMail: ResendVerificationMailResponse;
  login: LoginResponse;
  getNewTokens: GetNewTokensResponse;
  resetPassword: ResetPasswordResponse;
  newPassword: LoginResponse;
  updateUser: User;
  createProduct: CreateProductResponse;
  deleteProduct: DeleteProductResponse;
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


export type MutationVerifyMailArgs = {
  input: VerifyMailInput;
};


export type MutationResendVerificationMailArgs = {
  input: ResendVerificationMailInput;
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


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationDeleteProductArgs = {
  input: DeleteProductInput;
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
  username: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type VerifyMailInput = {
  email: Scalars['String']['input'];
  verifyEmailToken: Scalars['String']['input'];
};

export type ResendVerificationMailInput = {
  email: Scalars['String']['input'];
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
  address: Scalars['String']['input'];
};

export type CreateProductInput = {
  title: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  address: Scalars['String']['input'];
  images?: InputMaybe<Array<FileInputType>>;
  isGiveaway?: InputMaybe<Scalars['Boolean']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
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
};

export type DeleteProductInput = {
  id: Scalars['String']['input'];
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
  phoneNumber: Scalars['String']['input'];
};

export type PurchaseProductInput = {
  productId: Scalars['String']['input'];
};

export type AcceptPurchaseInput = {
  purchaseId: Scalars['String']['input'];
};

export type GetNewTokensMutationVariables = Exact<{
  input: GetNewTokensInput;
}>;


export type GetNewTokensMutation = { __typename?: 'Mutation', getNewTokens: { __typename?: 'GetNewTokensResponse', accessToken: string, refreshToken: string } };


export const GetNewTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetNewTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNewTokensInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNewTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<GetNewTokensMutation, GetNewTokensMutationVariables>;