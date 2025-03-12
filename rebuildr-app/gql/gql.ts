/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n": types.GetNewTokensDocument,
    "\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n": types.LandingQueryDocument,
    "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.NewPasswordDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n": types.ResetPasswordDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n"): (typeof documents)["\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n"): (typeof documents)["\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;