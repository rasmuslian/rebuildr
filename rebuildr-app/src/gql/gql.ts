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
  "\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n":
    types.GetNewTokensDocument,
  "\n  query LoggedInNavigation {\n    me {\n      id\n      username\n      role\n    }\n  }\n":
    types.LoggedInNavigationDocument,
  "\n  query AccountQuery {\n    me {\n      id\n      username\n      email\n      address\n      role\n    }\n  }\n":
    types.AccountQueryDocument,
  "\n  mutation UpdateAccount($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      address\n    }\n  }\n  ":
    types.UpdateAccountDocument,
  "\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      otherUser {\n        id\n        username\n      }\n      messages {\n        id\n        receiverId\n        createdAt\n        body\n      }\n    }\n  }\n":
    types.ConversationQueryDocument,
  "\nmutation SendMessage($input: CreateMessageInput!) {\n  createMessage(input: $input) {\n    createdAt\n    body  \n  }\n}\n":
    types.SendMessageDocument,
  "\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        username\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n":
    types.ConversationsQueryDocument,
  "\n  query EditCategoriesQuery {\n    rootCategories {\n      id\n      name\n      inSelection\n      inSeason\n      children {\n        id\n        name\n        inSelection\n        inSeason\n      }\n    }\n  }\n":
    types.EditCategoriesQueryDocument,
  "\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      id\n      inSelection\n      inSeason\n    }\n  }\n  ":
    types.UpdateCategoryDocument,
  "\n  query LandingQuery($popularCategoriesInput: PopularCategoriesInput) {\n    rootCategories {\n      id\n      name\n      icon\n    }\n    popularCategories(input: $popularCategoriesInput) {\n      id\n      name\n      image {\n        id\n        presignedGetUrl\n      }\n    }\n  }\n":
    types.LandingQueryDocument,
  "\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n  ":
    types.LocationToAddressDocument,
  "\n    query LocationSearchQuery($input: LocationSearchInput!) {\n      locationSearch(input: $input) {\n        result\n      }\n    }\n      ":
    types.LocationSearchQueryDocument,
  "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n":
    types.LoginDocument,
  "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n":
    types.NewPasswordDocument,
  "\n  query ProductDetails($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      title\n      price\n      address\n      hiddenReason\n      brand\n      amount\n      height\n      width\n      depth\n      volume\n      condition\n      description\n      images {\n        presignedGetUrl\n      }\n      user {\n        id\n        username\n      }\n      category {\n        name\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      role\n    }\n  }\n":
    types.ProductDetailsDocument,
  "\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      title\n    }\n  }\n  ":
    types.DeleteProductDocument,
  "\n  mutation HideProduct($input: HideProductInput!) {\n    hideProduct(input: $input) {\n      id\n    }\n  }\n  ":
    types.HideProductDocument,
  "\n  mutation ShowProduct($input: ShowProductInput!) {\n    showProduct(input: $input) {\n      id\n    }\n  }\n  ":
    types.ShowProductDocument,
  "\n  query ProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        address\n        price\n        mainImage {\n          presignedGetUrl\n        }\n        location {\n          latitude\n          longitude\n        }\n      }\n      origin {\n        latitude\n        longitude\n      }\n    }\n  }\n":
    types.ProductsQueryDocument,
  "\n  query ProductsCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n    }\n  }\n  ":
    types.ProductsCategoryDocument,
  "\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      message\n    }\n  }\n":
    types.RegisterUserDocument,
  "\n  mutation ResendVerificationMail($input: ResendVerificationMailInput!) {\n    resendVerificationMail(input: $input) {\n      message\n    }\n  }\n  ":
    types.ResendVerificationMailDocument,
  "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n":
    types.ResetPasswordDocument,
  "\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n    me {\n      id\n      address\n    }\n  }\n":
    types.SellQueryDocument,
  "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      product {\n        title\n      }\n      presignedPutUrls\n    }\n  }\n":
    types.CreateProductDocument,
  "\n  mutation VerifyMail($input: VerifyMailInput!) {\n    verifyMail(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n":
    types.VerifyMailDocument,
  "\n  query RelevantProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        description\n        distanceFromPosition\n        likedByUser\n        user {\n          id\n          username\n        }\n        address\n        price\n        isGiveaway\n        mainImage {\n          presignedGetUrl\n        }\n      } \n    }\n  }\n":
    types.RelevantProductsQueryDocument,
  "\n  mutation LikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByUser\n    }\n  }\n  ":
    types.LikeProductDocument,
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
  source: "\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n",
): (typeof documents)["\nmutation GetNewTokens($input: GetNewTokensInput!) {\n  getNewTokens(input: $input) {\n    accessToken\n    refreshToken\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query LoggedInNavigation {\n    me {\n      id\n      username\n      role\n    }\n  }\n",
): (typeof documents)["\n  query LoggedInNavigation {\n    me {\n      id\n      username\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query AccountQuery {\n    me {\n      id\n      username\n      email\n      address\n      role\n    }\n  }\n",
): (typeof documents)["\n  query AccountQuery {\n    me {\n      id\n      username\n      email\n      address\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateAccount($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      address\n    }\n  }\n  ",
): (typeof documents)["\n  mutation UpdateAccount($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      address\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      otherUser {\n        id\n        username\n      }\n      messages {\n        id\n        receiverId\n        createdAt\n        body\n      }\n    }\n  }\n",
): (typeof documents)["\n  query ConversationQuery($input: ConversationInput!) {\n    conversation(input: $input) {\n      otherUser {\n        id\n        username\n      }\n      messages {\n        id\n        receiverId\n        createdAt\n        body\n      }\n    }\n  }\n"];
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
  source: "\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        username\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n",
): (typeof documents)["\n  query ConversationsQuery {\n    conversations {\n      otherUser {\n        id\n        username\n      }\n      latestMessageAt\n      product {\n        id\n        title\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query EditCategoriesQuery {\n    rootCategories {\n      id\n      name\n      inSelection\n      inSeason\n      children {\n        id\n        name\n        inSelection\n        inSeason\n      }\n    }\n  }\n",
): (typeof documents)["\n  query EditCategoriesQuery {\n    rootCategories {\n      id\n      name\n      inSelection\n      inSeason\n      children {\n        id\n        name\n        inSelection\n        inSeason\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      id\n      inSelection\n      inSeason\n    }\n  }\n  ",
): (typeof documents)["\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      id\n      inSelection\n      inSeason\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query LandingQuery($popularCategoriesInput: PopularCategoriesInput) {\n    rootCategories {\n      id\n      name\n      icon\n    }\n    popularCategories(input: $popularCategoriesInput) {\n      id\n      name\n      image {\n        id\n        presignedGetUrl\n      }\n    }\n  }\n",
): (typeof documents)["\n  query LandingQuery($popularCategoriesInput: PopularCategoriesInput) {\n    rootCategories {\n      id\n      name\n      icon\n    }\n    popularCategories(input: $popularCategoriesInput) {\n      id\n      name\n      image {\n        id\n        presignedGetUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n  ",
): (typeof documents)["\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n    query LocationSearchQuery($input: LocationSearchInput!) {\n      locationSearch(input: $input) {\n        result\n      }\n    }\n      ",
): (typeof documents)["\n    query LocationSearchQuery($input: LocationSearchInput!) {\n      locationSearch(input: $input) {\n        result\n      }\n    }\n      "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n",
): (typeof documents)["\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ProductDetails($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      title\n      price\n      address\n      hiddenReason\n      brand\n      amount\n      height\n      width\n      depth\n      volume\n      condition\n      description\n      images {\n        presignedGetUrl\n      }\n      user {\n        id\n        username\n      }\n      category {\n        name\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      role\n    }\n  }\n",
): (typeof documents)["\n  query ProductDetails($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      title\n      price\n      address\n      hiddenReason\n      brand\n      amount\n      height\n      width\n      depth\n      volume\n      condition\n      description\n      images {\n        presignedGetUrl\n      }\n      user {\n        id\n        username\n      }\n      category {\n        name\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      title\n    }\n  }\n  ",
): (typeof documents)["\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      title\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation HideProduct($input: HideProductInput!) {\n    hideProduct(input: $input) {\n      id\n    }\n  }\n  ",
): (typeof documents)["\n  mutation HideProduct($input: HideProductInput!) {\n    hideProduct(input: $input) {\n      id\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ShowProduct($input: ShowProductInput!) {\n    showProduct(input: $input) {\n      id\n    }\n  }\n  ",
): (typeof documents)["\n  mutation ShowProduct($input: ShowProductInput!) {\n    showProduct(input: $input) {\n      id\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        address\n        price\n        mainImage {\n          presignedGetUrl\n        }\n        location {\n          latitude\n          longitude\n        }\n      }\n      origin {\n        latitude\n        longitude\n      }\n    }\n  }\n",
): (typeof documents)["\n  query ProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        address\n        price\n        mainImage {\n          presignedGetUrl\n        }\n        location {\n          latitude\n          longitude\n        }\n      }\n      origin {\n        latitude\n        longitude\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ProductsCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n    }\n  }\n  ",
): (typeof documents)["\n  query ProductsCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n    }\n  }\n  "];
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
  source: "\n  mutation ResendVerificationMail($input: ResendVerificationMailInput!) {\n    resendVerificationMail(input: $input) {\n      message\n    }\n  }\n  ",
): (typeof documents)["\n  mutation ResendVerificationMail($input: ResendVerificationMailInput!) {\n    resendVerificationMail(input: $input) {\n      message\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n",
): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input){\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n    me {\n      id\n      address\n    }\n  }\n",
): (typeof documents)["\n  query SellQuery {\n    categories {\n      id\n      name\n      parentId\n    }\n    me {\n      id\n      address\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      product {\n        title\n      }\n      presignedPutUrls\n    }\n  }\n",
): (typeof documents)["\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      product {\n        title\n      }\n      presignedPutUrls\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation VerifyMail($input: VerifyMailInput!) {\n    verifyMail(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n",
): (typeof documents)["\n  mutation VerifyMail($input: VerifyMailInput!) {\n    verifyMail(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query RelevantProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        description\n        distanceFromPosition\n        likedByUser\n        user {\n          id\n          username\n        }\n        address\n        price\n        isGiveaway\n        mainImage {\n          presignedGetUrl\n        }\n      } \n    }\n  }\n",
): (typeof documents)["\n  query RelevantProductsQuery($input: ProductsInput!) {\n    products(input: $input) {\n      products {\n        id\n        title\n        description\n        distanceFromPosition\n        likedByUser\n        user {\n          id\n          username\n        }\n        address\n        price\n        isGiveaway\n        mainImage {\n          presignedGetUrl\n        }\n      } \n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation LikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByUser\n    }\n  }\n  ",
): (typeof documents)["\n  mutation LikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByUser\n    }\n  }\n  "];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
