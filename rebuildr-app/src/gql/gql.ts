/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "\n  query MeQuery {\n    me {\n      id\n      email\n    }\n  }\n":
    types.MeQueryDocument,
  "\n  query LoggedInNavigation {\n    me {\n      email\n    }\n  }\n":
    types.LoggedInNavigationDocument,
  "\n    query BuyQuery {\n      products {\n        id\n        title\n        price\n      }\n    }\n  ":
    types.BuyQueryDocument,
  "\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      id\n      senderId\n      receiverId\n      createdAt\n      body\n    }\n  }\n":
    types.ConversationQueryDocument,
  "\nmutation SendMessage($input: CreateMessageInput!) {\n  createMessage(input: $input) {\n    createdAt\n    body  \n  }\n}\n":
    types.SendMessageDocument,
  "\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        email\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n":
    types.ConversationsQueryDocument,
  "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        email\n      }\n    }\n  }\n":
    types.LoginDocument,
  "\n  query DetailedProduct($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      title\n      price\n      user {\n        id\n        email\n      }\n      category {\n        name\n      }\n    }\n  }\n":
    types.DetailedProductDocument,
  "\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      message\n    }\n  }\n":
    types.RegisterUserDocument,
  "\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n  }\n":
    types.SellQueryDocument,
  "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      title\n      price\n      category {\n        name\n      }\n    }\n  }\n":
    types.CreateProductDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query MeQuery {\n    me {\n      id\n      email\n    }\n  }\n",
): (typeof documents)["\n  query MeQuery {\n    me {\n      id\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query LoggedInNavigation {\n    me {\n      email\n    }\n  }\n",
): (typeof documents)["\n  query LoggedInNavigation {\n    me {\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n    query BuyQuery {\n      products {\n        id\n        title\n        price\n      }\n    }\n  ",
): (typeof documents)["\n    query BuyQuery {\n      products {\n        id\n        title\n        price\n      }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      id\n      senderId\n      receiverId\n      createdAt\n      body\n    }\n  }\n",
): (typeof documents)["\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      id\n      senderId\n      receiverId\n      createdAt\n      body\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\nmutation SendMessage($input: CreateMessageInput!) {\n  createMessage(input: $input) {\n    createdAt\n    body  \n  }\n}\n",
): (typeof documents)["\nmutation SendMessage($input: CreateMessageInput!) {\n  createMessage(input: $input) {\n    createdAt\n    body  \n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        email\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n",
): (typeof documents)["\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        email\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query DetailedProduct($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      title\n      price\n      user {\n        id\n        email\n      }\n      category {\n        name\n      }\n    }\n  }\n",
): (typeof documents)["\n  query DetailedProduct($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      title\n      price\n      user {\n        id\n        email\n      }\n      category {\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      message\n    }\n  }\n",
): (typeof documents)["\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n  }\n",
): (typeof documents)["\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      title\n      price\n      category {\n        name\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      title\n      price\n      category {\n        name\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
