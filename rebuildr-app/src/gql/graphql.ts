/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
};

export type Category = {
  __typename?: "Category";
  children: Array<Category>;
  id: Scalars["ID"]["output"];
  image?: Maybe<File>;
  inSeason: Scalars["Boolean"]["output"];
  inSelection: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  parentId?: Maybe<Scalars["String"]["output"]>;
};

export type CategoryInput = {
  id: Scalars["String"]["input"];
};

export type ConversationInput = {
  otherUserId: Scalars["String"]["input"];
  productId: Scalars["String"]["input"];
};

export type ConversationOverviewResponse = {
  __typename?: "ConversationOverviewResponse";
  latestMessageAt: Scalars["DateTime"]["output"];
  otherUser: User;
  product: Product;
};

export type ConversationResponse = {
  __typename?: "ConversationResponse";
  messages: Array<Message>;
  otherUser: User;
};

export type CreateMessageInput = {
  body: Scalars["String"]["input"];
  productId: Scalars["String"]["input"];
  receiverId: Scalars["String"]["input"];
};

export type CreateProductInput = {
  address: Scalars["String"]["input"];
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  brand?: InputMaybe<Scalars["String"]["input"]>;
  categoryId: Scalars["String"]["input"];
  condition: ProductConditionEnum;
  depth?: InputMaybe<Scalars["Float"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  height?: InputMaybe<Scalars["Float"]["input"]>;
  images?: InputMaybe<Array<FileInputType>>;
  isGiveaway?: InputMaybe<Scalars["Boolean"]["input"]>;
  price: Scalars["Float"]["input"];
  title: Scalars["String"]["input"];
  volume?: InputMaybe<Scalars["Float"]["input"]>;
  width?: InputMaybe<Scalars["Float"]["input"]>;
};

export type CreateProductResponse = {
  __typename?: "CreateProductResponse";
  presignedPutUrls: Array<Scalars["String"]["output"]>;
  product: Product;
};

export type DeleteProductInput = {
  id: Scalars["String"]["input"];
};

export type DeleteProductResponse = {
  __typename?: "DeleteProductResponse";
  title: Scalars["String"]["output"];
};

export type File = {
  __typename?: "File";
  id: Scalars["ID"]["output"];
  presignedGetUrl: Scalars["String"]["output"];
};

export type FileInputType = {
  mimeType: Scalars["String"]["input"];
};

export type GetAddressInput = {
  latitude: Scalars["Float"]["input"];
  longitude: Scalars["Float"]["input"];
};

export type GetAddressResponse = {
  __typename?: "GetAddressResponse";
  address: Scalars["String"]["output"];
};

export type GetNewTokensInput = {
  accessToken: Scalars["String"]["input"];
  refreshToken: Scalars["String"]["input"];
};

export type GetNewTokensResponse = {
  __typename?: "GetNewTokensResponse";
  accessToken: Scalars["String"]["output"];
  refreshToken: Scalars["String"]["output"];
};

export type GetProductInput = {
  id: Scalars["String"]["input"];
};

export type HideProductInput = {
  id: Scalars["String"]["input"];
  reason: Scalars["String"]["input"];
};

export type LocationSearchInput = {
  searchString: Scalars["String"]["input"];
};

export type LocationSearchResponse = {
  __typename?: "LocationSearchResponse";
  result: Array<Scalars["String"]["output"]>;
};

export type LocationType = {
  latitude: Scalars["Float"]["input"];
  longitude: Scalars["Float"]["input"];
};

export type LoginInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type LoginResponse = {
  __typename?: "LoginResponse";
  accessToken: Scalars["String"]["output"];
  refreshToken: Scalars["String"]["output"];
  user: User;
};

export type Message = {
  __typename?: "Message";
  body: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  receiverId: Scalars["ID"]["output"];
  senderId: Scalars["ID"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  createMessage: Message;
  createProduct: CreateProductResponse;
  deleteProduct: DeleteProductResponse;
  getNewTokens: GetNewTokensResponse;
  hideProduct: Product;
  login: LoginResponse;
  newPassword: LoginResponse;
  registerUser: RegisterUserResponse;
  resendVerificationMail: ResendVerificationMailResponse;
  resetPassword: ResetPasswordResponse;
  showProduct: Product;
  updateCategory: Category;
  updateUser: User;
  verifyMail: LoginResponse;
};

export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};

export type MutationCreateProductArgs = {
  input: CreateProductInput;
};

export type MutationDeleteProductArgs = {
  input: DeleteProductInput;
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

export type MutationNewPasswordArgs = {
  input: NewPasswordInput;
};

export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};

export type MutationResendVerificationMailArgs = {
  input: ResendVerificationMailInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationShowProductArgs = {
  input: ShowProductInput;
};

export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationVerifyMailArgs = {
  input: VerifyMailInput;
};

export type NewPasswordInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  resetPasswordToken: Scalars["String"]["input"];
};

export enum OrderProductsEnum {
  Distance = "DISTANCE",
  Latest = "LATEST",
}

export type PopularCategoriesInput = {
  limit: Scalars["Int"]["input"];
};

export type Product = {
  __typename?: "Product";
  address: Scalars["String"]["output"];
  amount?: Maybe<Scalars["Int"]["output"]>;
  brand?: Maybe<Scalars["String"]["output"]>;
  category: Category;
  condition: ProductConditionEnum;
  createdAt: Scalars["DateTime"]["output"];
  /** Unit: millimeter */
  depth?: Maybe<Scalars["Int"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  distanceFromPosition?: Maybe<Scalars["Float"]["output"]>;
  /** Unit: millimeter */
  height?: Maybe<Scalars["Int"]["output"]>;
  hiddenReason?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  images: Array<File>;
  isGiveaway: Scalars["Boolean"]["output"];
  mainImage?: Maybe<File>;
  price: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
  user: User;
  /** Unit: liter */
  volume?: Maybe<Scalars["Int"]["output"]>;
  /** Unit: millimeter */
  width?: Maybe<Scalars["Int"]["output"]>;
};

export enum ProductConditionEnum {
  Bad = "BAD",
  Good = "GOOD",
  New = "NEW",
  Okay = "OKAY",
  VeryGood = "VERY_GOOD",
}

export type ProductsInput = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  categoryId?: InputMaybe<Scalars["String"]["input"]>;
  condition?: InputMaybe<Scalars["String"]["input"]>;
  distance?: InputMaybe<Scalars["Float"]["input"]>;
  giveaway?: InputMaybe<Scalars["Boolean"]["input"]>;
  limit?: InputMaybe<Scalars["Float"]["input"]>;
  location?: InputMaybe<LocationType>;
  orderBy?: InputMaybe<OrderProductsEnum>;
  searchString?: InputMaybe<Scalars["String"]["input"]>;
  seasonalCategories?: InputMaybe<Scalars["Boolean"]["input"]>;
  selectionCategories?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  categories: Array<Category>;
  category: Category;
  conversation: ConversationResponse;
  conversations: Array<ConversationOverviewResponse>;
  locationSearch: LocationSearchResponse;
  locationToAddress: GetAddressResponse;
  me: User;
  popularCategories: Array<Category>;
  product: Product;
  products: Array<Product>;
  rootCategories: Array<Category>;
};

export type QueryCategoryArgs = {
  input: CategoryInput;
};

export type QueryConversationArgs = {
  input: ConversationInput;
};

export type QueryLocationSearchArgs = {
  input: LocationSearchInput;
};

export type QueryLocationToAddressArgs = {
  input: GetAddressInput;
};

export type QueryPopularCategoriesArgs = {
  input?: InputMaybe<PopularCategoriesInput>;
};

export type QueryProductArgs = {
  input: GetProductInput;
};

export type QueryProductsArgs = {
  input: ProductsInput;
};

export type RegisterUserInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type RegisterUserResponse = {
  __typename?: "RegisterUserResponse";
  message: Scalars["String"]["output"];
};

export type ResendVerificationMailInput = {
  email: Scalars["String"]["input"];
};

export type ResendVerificationMailResponse = {
  __typename?: "ResendVerificationMailResponse";
  message: Scalars["String"]["output"];
};

export type ResetPasswordInput = {
  email: Scalars["String"]["input"];
};

export type ResetPasswordResponse = {
  __typename?: "ResetPasswordResponse";
  message: Scalars["String"]["output"];
};

export type ShowProductInput = {
  id: Scalars["String"]["input"];
};

export type UpdateCategoryInput = {
  id: Scalars["String"]["input"];
  inSeason?: InputMaybe<Scalars["Boolean"]["input"]>;
  inSelection?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateUserInput = {
  address: Scalars["String"]["input"];
  id: Scalars["String"]["input"];
};

export type User = {
  __typename?: "User";
  address?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  role: UserRoleEnum;
};

export enum UserRoleEnum {
  Admin = "ADMIN",
  User = "USER",
}

export type VerifyMailInput = {
  email: Scalars["String"]["input"];
  verifyEmailToken: Scalars["String"]["input"];
};

export type GetNewTokensMutationVariables = Exact<{
  input: GetNewTokensInput;
}>;

export type GetNewTokensMutation = {
  __typename?: "Mutation";
  getNewTokens: {
    __typename?: "GetNewTokensResponse";
    accessToken: string;
    refreshToken: string;
  };
};

export type LoggedInNavigationQueryVariables = Exact<{ [key: string]: never }>;

export type LoggedInNavigationQuery = {
  __typename?: "Query";
  me: { __typename?: "User"; id: string; email: string; role: UserRoleEnum };
};

export type AccountQueryQueryVariables = Exact<{ [key: string]: never }>;

export type AccountQueryQuery = {
  __typename?: "Query";
  me: {
    __typename?: "User";
    id: string;
    email: string;
    address?: string | null;
    role: UserRoleEnum;
  };
};

export type UpdateAccountMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateAccountMutation = {
  __typename?: "Mutation";
  updateUser: {
    __typename?: "User";
    id: string;
    email: string;
    address?: string | null;
  };
};

export type ConversationQueryQueryVariables = Exact<{
  input: ConversationInput;
}>;

export type ConversationQueryQuery = {
  __typename?: "Query";
  conversation: {
    __typename?: "ConversationResponse";
    otherUser: { __typename?: "User"; id: string; email: string };
    messages: Array<{
      __typename?: "Message";
      id: string;
      receiverId: string;
      createdAt: any;
      body: string;
    }>;
  };
};

export type SendMessageMutationVariables = Exact<{
  input: CreateMessageInput;
}>;

export type SendMessageMutation = {
  __typename?: "Mutation";
  createMessage: { __typename?: "Message"; createdAt: any; body: string };
};

export type ConversationsQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ConversationsQueryQuery = {
  __typename?: "Query";
  conversations: Array<{
    __typename?: "ConversationOverviewResponse";
    latestMessageAt: any;
    otherUser: { __typename?: "User"; id: string; email: string };
    product: { __typename?: "Product"; id: string; title: string };
  }>;
};

export type EditCategoriesQueryQueryVariables = Exact<{ [key: string]: never }>;

export type EditCategoriesQueryQuery = {
  __typename?: "Query";
  rootCategories: Array<{
    __typename?: "Category";
    id: string;
    name: string;
    inSelection: boolean;
    inSeason: boolean;
    children: Array<{
      __typename?: "Category";
      id: string;
      name: string;
      inSelection: boolean;
      inSeason: boolean;
    }>;
  }>;
};

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
}>;

export type UpdateCategoryMutation = {
  __typename?: "Mutation";
  updateCategory: {
    __typename?: "Category";
    id: string;
    inSelection: boolean;
    inSeason: boolean;
  };
};

export type LandingQueryQueryVariables = Exact<{
  popularCategoriesInput?: InputMaybe<PopularCategoriesInput>;
}>;

export type LandingQueryQuery = {
  __typename?: "Query";
  rootCategories: Array<{ __typename?: "Category"; id: string; name: string }>;
  popularCategories: Array<{
    __typename?: "Category";
    id: string;
    name: string;
    image?: { __typename?: "File"; id: string; presignedGetUrl: string } | null;
  }>;
};

export type NearbyProductsQueryQueryVariables = Exact<{
  input: ProductsInput;
}>;

export type NearbyProductsQueryQuery = {
  __typename?: "Query";
  products: Array<{
    __typename?: "Product";
    id: string;
    title: string;
    description?: string | null;
    distanceFromPosition?: number | null;
    address: string;
    price: number;
    user: { __typename?: "User"; id: string; email: string };
    mainImage?: { __typename?: "File"; presignedGetUrl: string } | null;
  }>;
};

export type LocationToAddressQueryVariables = Exact<{
  input: GetAddressInput;
}>;

export type LocationToAddressQuery = {
  __typename?: "Query";
  locationToAddress: { __typename?: "GetAddressResponse"; address: string };
};

export type LocationSearchQueryQueryVariables = Exact<{
  input: LocationSearchInput;
}>;

export type LocationSearchQueryQuery = {
  __typename?: "Query";
  locationSearch: {
    __typename?: "LocationSearchResponse";
    result: Array<string>;
  };
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;

export type LoginMutation = {
  __typename?: "Mutation";
  login: {
    __typename?: "LoginResponse";
    accessToken: string;
    refreshToken: string;
    user: { __typename?: "User"; email: string };
  };
};

export type NewPasswordMutationVariables = Exact<{
  input: NewPasswordInput;
}>;

export type NewPasswordMutation = {
  __typename?: "Mutation";
  newPassword: {
    __typename?: "LoginResponse";
    accessToken: string;
    refreshToken: string;
  };
};

export type ProductDetailsQueryVariables = Exact<{
  input: GetProductInput;
  isLoggedIn: Scalars["Boolean"]["input"];
}>;

export type ProductDetailsQuery = {
  __typename?: "Query";
  product: {
    __typename?: "Product";
    id: string;
    title: string;
    price: number;
    address: string;
    hiddenReason?: string | null;
    brand?: string | null;
    amount?: number | null;
    height?: number | null;
    width?: number | null;
    depth?: number | null;
    volume?: number | null;
    condition: ProductConditionEnum;
    description?: string | null;
    images: Array<{ __typename?: "File"; presignedGetUrl: string }>;
    user: { __typename?: "User"; id: string; email: string };
    category: { __typename?: "Category"; name: string };
  };
  me?: { __typename?: "User"; id: string; role: UserRoleEnum };
};

export type DeleteProductMutationVariables = Exact<{
  input: DeleteProductInput;
}>;

export type DeleteProductMutation = {
  __typename?: "Mutation";
  deleteProduct: { __typename?: "DeleteProductResponse"; title: string };
};

export type HideProductMutationVariables = Exact<{
  input: HideProductInput;
}>;

export type HideProductMutation = {
  __typename?: "Mutation";
  hideProduct: { __typename?: "Product"; id: string };
};

export type ShowProductMutationVariables = Exact<{
  input: ShowProductInput;
}>;

export type ShowProductMutation = {
  __typename?: "Mutation";
  showProduct: { __typename?: "Product"; id: string };
};

export type ProductsQueryQueryVariables = Exact<{
  input: ProductsInput;
}>;

export type ProductsQueryQuery = {
  __typename?: "Query";
  products: Array<{
    __typename?: "Product";
    id: string;
    title: string;
    address: string;
    price: number;
    mainImage?: { __typename?: "File"; presignedGetUrl: string } | null;
  }>;
};

export type ProductsCategoryQueryVariables = Exact<{
  input: CategoryInput;
}>;

export type ProductsCategoryQuery = {
  __typename?: "Query";
  category: { __typename?: "Category"; id: string; name: string };
};

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;

export type RegisterUserMutation = {
  __typename?: "Mutation";
  registerUser: { __typename?: "RegisterUserResponse"; message: string };
};

export type ResendVerificationMailMutationVariables = Exact<{
  input: ResendVerificationMailInput;
}>;

export type ResendVerificationMailMutation = {
  __typename?: "Mutation";
  resendVerificationMail: {
    __typename?: "ResendVerificationMailResponse";
    message: string;
  };
};

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;

export type ResetPasswordMutation = {
  __typename?: "Mutation";
  resetPassword: { __typename?: "ResetPasswordResponse"; message: string };
};

export type SellQueryQueryVariables = Exact<{ [key: string]: never }>;

export type SellQueryQuery = {
  __typename?: "Query";
  categories: Array<{
    __typename?: "Category";
    id: string;
    name: string;
    parentId?: string | null;
  }>;
  me: {
    __typename?: "User";
    id: string;
    email: string;
    address?: string | null;
  };
};

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;

export type CreateProductMutation = {
  __typename?: "Mutation";
  createProduct: {
    __typename?: "CreateProductResponse";
    presignedPutUrls: Array<string>;
    product: { __typename?: "Product"; title: string };
  };
};

export type VerifyMailMutationVariables = Exact<{
  input: VerifyMailInput;
}>;

export type VerifyMailMutation = {
  __typename?: "Mutation";
  verifyMail: {
    __typename?: "LoginResponse";
    accessToken: string;
    refreshToken: string;
  };
};

export const GetNewTokensDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GetNewTokens" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GetNewTokensInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getNewTokens" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "refreshToken" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetNewTokensMutation,
  GetNewTokensMutationVariables
>;
export const LoggedInNavigationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LoggedInNavigation" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LoggedInNavigationQuery,
  LoggedInNavigationQueryVariables
>;
export const AccountQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AccountQuery" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountQueryQuery, AccountQueryQueryVariables>;
export const UpdateAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateAccountMutation,
  UpdateAccountMutationVariables
>;
export const ConversationQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ConversationQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ConversationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "otherUser" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "messages" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "receiverId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "body" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationQueryQuery,
  ConversationQueryQueryVariables
>;
export const SendMessageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SendMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateMessageInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createMessage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const ConversationsQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ConversationsQuery" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "otherUser" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "latestMessageAt" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "product" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationsQueryQuery,
  ConversationsQueryQueryVariables
>;
export const EditCategoriesQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "EditCategoriesQuery" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rootCategories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "inSelection" } },
                { kind: "Field", name: { kind: "Name", value: "inSeason" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "children" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "inSelection" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "inSeason" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditCategoriesQueryQuery,
  EditCategoriesQueryQueryVariables
>;
export const UpdateCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateCategoryInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "inSelection" } },
                { kind: "Field", name: { kind: "Name", value: "inSeason" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCategoryMutation,
  UpdateCategoryMutationVariables
>;
export const LandingQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LandingQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "popularCategoriesInput" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "PopularCategoriesInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rootCategories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "popularCategories" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "popularCategoriesInput" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "image" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presignedGetUrl" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LandingQueryQuery, LandingQueryQueryVariables>;
export const NearbyProductsQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "NearbyProductsQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductsInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "products" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "distanceFromPosition" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "price" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mainImage" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presignedGetUrl" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  NearbyProductsQueryQuery,
  NearbyProductsQueryQueryVariables
>;
export const LocationToAddressDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LocationToAddress" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GetAddressInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "locationToAddress" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "address" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LocationToAddressQuery,
  LocationToAddressQueryVariables
>;
export const LocationSearchQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LocationSearchQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "LocationSearchInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "locationSearch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "result" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LocationSearchQueryQuery,
  LocationSearchQueryQueryVariables
>;
export const LoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "Login" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "LoginInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "login" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "refreshToken" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const NewPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "NewPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "NewPasswordInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "newPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "refreshToken" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NewPasswordMutation, NewPasswordMutationVariables>;
export const ProductDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductDetails" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GetProductInput" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isLoggedIn" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "product" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "price" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "hiddenReason" },
                },
                { kind: "Field", name: { kind: "Name", value: "brand" } },
                { kind: "Field", name: { kind: "Name", value: "amount" } },
                { kind: "Field", name: { kind: "Name", value: "height" } },
                { kind: "Field", name: { kind: "Name", value: "width" } },
                { kind: "Field", name: { kind: "Name", value: "depth" } },
                { kind: "Field", name: { kind: "Name", value: "volume" } },
                { kind: "Field", name: { kind: "Name", value: "condition" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "images" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presignedGetUrl" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "category" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            directives: [
              {
                kind: "Directive",
                name: { kind: "Name", value: "include" },
                arguments: [
                  {
                    kind: "Argument",
                    name: { kind: "Name", value: "if" },
                    value: {
                      kind: "Variable",
                      name: { kind: "Name", value: "isLoggedIn" },
                    },
                  },
                ],
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductDetailsQuery, ProductDetailsQueryVariables>;
export const DeleteProductDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteProduct" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "DeleteProductInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteProduct" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProductMutation,
  DeleteProductMutationVariables
>;
export const HideProductDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "HideProduct" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "HideProductInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hideProduct" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HideProductMutation, HideProductMutationVariables>;
export const ShowProductDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ShowProduct" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ShowProductInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "showProduct" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ShowProductMutation, ShowProductMutationVariables>;
export const ProductsQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductsQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductsInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "products" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "price" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mainImage" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presignedGetUrl" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductsQueryQuery, ProductsQueryQueryVariables>;
export const ProductsCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductsCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CategoryInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProductsCategoryQuery,
  ProductsCategoryQueryVariables
>;
export const RegisterUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RegisterUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "RegisterUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "registerUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RegisterUserMutation,
  RegisterUserMutationVariables
>;
export const ResendVerificationMailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ResendVerificationMail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ResendVerificationMailInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resendVerificationMail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResendVerificationMailMutation,
  ResendVerificationMailMutationVariables
>;
export const ResetPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ResetPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ResetPasswordInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resetPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const SellQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SellQuery" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "parentId" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SellQueryQuery, SellQueryQueryVariables>;
export const CreateProductDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateProduct" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateProductInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createProduct" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "product" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "presignedPutUrls" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProductMutation,
  CreateProductMutationVariables
>;
export const VerifyMailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "VerifyMail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "VerifyMailInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "verifyMail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "refreshToken" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyMailMutation, VerifyMailMutationVariables>;
