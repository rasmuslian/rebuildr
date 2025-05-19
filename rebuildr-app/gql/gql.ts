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
    "\n  query LocationSearchQuery($input: LocationSearchInput!) {\n    locationSearch(input: $input) {\n      result\n    }\n  }\n": types.LocationSearchQueryDocument,
    "\n  query AddressToLocationQuery($input: AddressToLocationInput!) {\n    addressToLocation(input: $input) {\n      lat\n      lng\n    }\n  }\n": types.AddressToLocationQueryDocument,
    "\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n": types.LocationToAddressDocument,
    "\n  query BrandSection($input: CategoryInput!) {\n    brands {\n      id\n      name\n      type\n    }\n    category(input: $input) {\n      id\n      brands {\n        id\n        name\n      }\n    }\n  }\n": types.BrandSectionDocument,
    "\n  query CategorySection($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      children {\n        id\n        name\n        image {\n          id\n          url\n        }\n      }\n    }\n  }\n": types.CategorySectionDocument,
    "\n  query CategorySectionSelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n  }\n": types.CategorySectionSelectedCategoryDocument,
    "\n  query RootCategorySection {\n    rootCategories {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n      orderIndex\n    }\n  }\n": types.RootCategorySectionDocument,
    "\n  query RootCategorySelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n    }\n  }\n": types.RootCategorySelectedCategoryDocument,
    "\n  query BrandFilter {\n    brands {\n      id\n      name\n      type\n    }\n  }\n": types.BrandFilterDocument,
    "\n  query RecommendedQuantitiesQuery($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      primaryQuantityUnit\n      secondaryQuantityUnit\n    }\n  }\n": types.RecommendedQuantitiesQueryDocument,
    "\n  query CategoryFilter($input: GetCategoriesInput!) {\n    getCategories(input: $input) {\n      id\n      name\n    }\n  }\n": types.CategoryFilterDocument,
    "\n  query RootCategoryFilter {\n    rootCategories {\n      id\n      name\n    }\n  }\n": types.RootCategoryFilterDocument,
    "\n  query CreateBusinessQuery {\n    me {\n      id\n    }\n  }\n": types.CreateBusinessQueryDocument,
    "\n  mutation CreateBusiness($input: CreateOrganizationUserInput!) {\n    createOrganizationUser(input: $input) {\n      id\n      username\n      organizationNumber\n    }\n  }\n": types.CreateBusinessDocument,
    "\n  query DetailsQuery {\n    me {\n      id\n      email\n    }\n  }\n": types.DetailsQueryDocument,
    "\n  mutation UpdateDetailsFields($input: FinalizeUserInput!) {\n    finalizeUser(input: $input) {\n      id\n      username\n    }\n  }\n": types.UpdateDetailsFieldsDocument,
    "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      user {\n        id\n      }\n      accessToken\n      refreshToken\n    }\n  }\n": types.VerifyEmailDocument,
    "\n  mutation ResendVerificationMail($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n": types.ResendVerificationMailDocument,
    "\n  mutation CreateBankgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n": types.CreateBankgiroPayoutAccountDocument,
    "\n  mutation CreatePlusgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n": types.CreatePlusgiroPayoutAccountDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      message\n    }\n  }\n": types.ResetPasswordDocument,
    "\n  query UserExists($input: UserExistsInput!) {\n    userExists(input: $input) {\n      registrationStatus\n    }\n  }\n": types.UserExistsDocument,
    "\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n": types.RegisterUserDocument,
    "\n  mutation CreateRixPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n": types.CreateRixPayoutAccountDocument,
    "\n  mutation CreateSwishPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n": types.CreateSwishPayoutAccountDocument,
    "\n  mutation CreateTrustlyPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n      trustlyUrl\n    }\n  }\n": types.CreateTrustlyPayoutAccountDocument,
    "\n  query EditProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n": types.EditProjectQueryDocument,
    "\n  mutation UpdateProject($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n": types.UpdateProjectDocument,
    "\n  query PreviewProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n": types.PreviewProjectQueryDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n    }\n  }\n": types.CreateProjectDocument,
    "\n  query DeliveryQuer($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n": types.DeliveryQuerDocument,
    "\n  mutation DeliveryUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        deliveryRadius\n        deliveryPrice\n        deliveryEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n": types.DeliveryUpdateDocument,
    "\n  query PickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      pickupEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n": types.PickupQueryDocument,
    "\n  mutation UpdatePickup($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        pickupEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n": types.UpdatePickupDocument,
    "\n  query PreviewPickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n": types.PreviewPickupQueryDocument,
    "\n  query ShippingQuery($input: GetProductInput!) {\n    getAllShippingPrices {\n      id\n      maxWeight\n      price\n      provider\n    }\n    product(input: $input) {\n      id\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n": types.ShippingQueryDocument,
    "\n  mutation UpdateShipping($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        shippingPrices {\n          id\n          maxWeight\n          price\n          provider\n        }\n      }\n    }\n  }\n": types.UpdateShippingDocument,
    "\n  query AppQuery($isLoggedIn: Boolean!) {\n    me @include(if: $isLoggedIn) {\n      id\n      registrationStatus\n    }\n  }\n": types.AppQueryDocument,
    "\n  query ProductView($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      createdAt\n      updatedAt\n      canDelete\n      likedByMe\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        hasChildren\n        ancestorIds\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        projectPicture {\n          id\n          url\n        }\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        products {\n          id\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n      seller {\n        id\n        type\n        username\n        rating\n        numberOfPublishedProducts\n        numberOfSoldProducts\n        products {\n          id\n          title\n          likedByMe\n          primaryQuantity\n          primaryUnit\n          condition\n          price\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      address\n    }\n  }\n": types.ProductViewDocument,
    "\n  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByMe\n    }\n  }\n": types.ProductViewLikeProductDocument,
    "\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n": types.LandingQueryDocument,
    "\n  mutation AuthenticateRocker($input: AuthenticateRockerInput!) {\n    authenticateRocker(input: $input) {\n      status\n      qrCode\n      autoStartToken\n    }\n  }\n": types.AuthenticateRockerDocument,
    "\n  query Search($isLoggedIn: Boolean!, $searchResult: GetSearchResultsInput!) {\n    popularCategories {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n    getSearchResults(input: $searchResult) @include(if: $isLoggedIn) {\n      id\n      searchString\n      count\n    }\n    me @include(if: $isLoggedIn) {\n      id\n    }\n  }\n": types.SearchDocument,
    "\n  query DoSearch(\n    $searchResultsInput: GetSimilarSearchResultsInput!\n    $usersInput: GetUsersInput!\n  ) {\n    getSimilarSearchResults(input: $searchResultsInput) {\n      id\n      searchString\n      count\n    }\n    getUsers(input: $usersInput) {\n      id\n      username\n      type\n      numberOfPublishedProducts\n      numberOfSoldProducts\n      profilePicture {\n        id\n        url\n      }\n    }\n  }\n": types.DoSearchDocument,
    "\n  mutation ClearSearchHistory {\n    clearSearchHistory\n  }\n": types.ClearSearchHistoryDocument,
    "\n  mutation CreateSearchResult($input: CreateSearchResultInput!) {\n    createSearchResult(input: $input) {\n      id\n      searchString\n      count\n    }\n  }\n": types.CreateSearchResultDocument,
    "\n  query SearchProducts(\n    $input: ProductsInput!\n    $limit: Int\n    $offset: Int\n    $isLoggedIn: Boolean!\n  ) {\n    products(input: $input, limit: $limit, offset: $offset) {\n      products {\n        id\n        title\n        price\n        condition\n        primaryQuantity\n        primaryUnit\n        likedByMe\n        brand {\n          id\n          name\n        }\n        primaryImage {\n          id\n          url\n        }\n        approximatePlace {\n          address\n        }\n        seller {\n          id\n          type\n          rating\n        }\n      }\n      total\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      location {\n        lat\n        lng\n      }\n      address\n    }\n  }\n": types.SearchProductsDocument,
    "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.NewPasswordDocument,
    "\n  fragment ProductDetailsFragment on Product {\n    id\n    title\n    description\n    price\n    isGiveaway\n    condition\n    primaryQuantity\n    primaryUnit\n    secondaryQuantity\n    secondaryUnit\n    height\n    width\n    length\n    thickness\n    diameter\n    weight\n    images {\n      id\n      mimeType\n      url\n      name\n    }\n    documents {\n      id\n      mimeType\n      url\n      name\n    }\n    category {\n      id\n      name\n      hasChildren\n      ancestorIds\n    }\n    brand {\n      id\n      type\n    }\n  }\n": types.ProductDetailsFragmentFragmentDoc,
    "\n  mutation SellProductCreateDraft {\n    createDraftProduct {\n      ...ProductDetailsFragment\n    }\n  }\n  \n": types.SellProductCreateDraftDocument,
    "\n  query SellProductQuery {\n    getDraftedProduct {\n      ...ProductDetailsFragment\n    }\n    me {\n      id\n      selectedPayoutMethod\n    }\n  }\n  \n": types.SellProductQueryDocument,
    "\n  mutation SellProductUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        ...ProductDetailsFragment\n      }\n      imagePutUrls\n      documentPutUrls\n    }\n  }\n  \n": types.SellProductUpdateDocument,
    "\n  query TransportationQuery {\n    getDraftedProduct {\n      id\n      address\n      pickupEnabled\n      deliveryEnabled\n      deliveryPrice\n      deliveryRadius\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n": types.TransportationQueryDocument,
    "\n  query PreviewDraftedProduct {\n    getDraftedProduct {\n      id\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n    me {\n      id\n      address\n    }\n  }\n": types.PreviewDraftedProductDocument,
    "\n  mutation PublishProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        status\n      }\n    }\n  }\n": types.PublishProductDocument,
    "\n  query RootPayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n": types.RootPayoutMethodQueryDocument,
    "\n  query PayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n": types.PayoutMethodQueryDocument,
    "\n  query ProjectGetMyProjects {\n    myProjects {\n      id\n      title\n    }\n    getDraftedProduct {\n      id\n      project {\n        id\n      }\n    }\n  }\n": types.ProjectGetMyProjectsDocument,
    "\n  query ProjectGetProject($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n": types.ProjectGetProjectDocument,
    "\n  mutation ProjectUpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        project {\n          id\n        }\n      }\n    }\n  }\n": types.ProjectUpdateProductDocument,
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
export function graphql(source: "\n  query LocationSearchQuery($input: LocationSearchInput!) {\n    locationSearch(input: $input) {\n      result\n    }\n  }\n"): (typeof documents)["\n  query LocationSearchQuery($input: LocationSearchInput!) {\n    locationSearch(input: $input) {\n      result\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AddressToLocationQuery($input: AddressToLocationInput!) {\n    addressToLocation(input: $input) {\n      lat\n      lng\n    }\n  }\n"): (typeof documents)["\n  query AddressToLocationQuery($input: AddressToLocationInput!) {\n    addressToLocation(input: $input) {\n      lat\n      lng\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n"): (typeof documents)["\n  query LocationToAddress($input: GetAddressInput!) {\n    locationToAddress(input: $input) {\n      address\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BrandSection($input: CategoryInput!) {\n    brands {\n      id\n      name\n      type\n    }\n    category(input: $input) {\n      id\n      brands {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query BrandSection($input: CategoryInput!) {\n    brands {\n      id\n      name\n      type\n    }\n    category(input: $input) {\n      id\n      brands {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategorySection($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      children {\n        id\n        name\n        image {\n          id\n          url\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategorySection($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      children {\n        id\n        name\n        image {\n          id\n          url\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategorySectionSelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategorySectionSelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootCategorySection {\n    rootCategories {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n      orderIndex\n    }\n  }\n"): (typeof documents)["\n  query RootCategorySection {\n    rootCategories {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n      orderIndex\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootCategorySelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n    }\n  }\n"): (typeof documents)["\n  query RootCategorySelectedCategory($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      name\n      description\n      image {\n        id\n        url\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BrandFilter {\n    brands {\n      id\n      name\n      type\n    }\n  }\n"): (typeof documents)["\n  query BrandFilter {\n    brands {\n      id\n      name\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecommendedQuantitiesQuery($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      primaryQuantityUnit\n      secondaryQuantityUnit\n    }\n  }\n"): (typeof documents)["\n  query RecommendedQuantitiesQuery($input: CategoryInput!) {\n    category(input: $input) {\n      id\n      primaryQuantityUnit\n      secondaryQuantityUnit\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoryFilter($input: GetCategoriesInput!) {\n    getCategories(input: $input) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query CategoryFilter($input: GetCategoriesInput!) {\n    getCategories(input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootCategoryFilter {\n    rootCategories {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query RootCategoryFilter {\n    rootCategories {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CreateBusinessQuery {\n    me {\n      id\n    }\n  }\n"): (typeof documents)["\n  query CreateBusinessQuery {\n    me {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBusiness($input: CreateOrganizationUserInput!) {\n    createOrganizationUser(input: $input) {\n      id\n      username\n      organizationNumber\n    }\n  }\n"): (typeof documents)["\n  mutation CreateBusiness($input: CreateOrganizationUserInput!) {\n    createOrganizationUser(input: $input) {\n      id\n      username\n      organizationNumber\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DetailsQuery {\n    me {\n      id\n      email\n    }\n  }\n"): (typeof documents)["\n  query DetailsQuery {\n    me {\n      id\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateDetailsFields($input: FinalizeUserInput!) {\n    finalizeUser(input: $input) {\n      id\n      username\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateDetailsFields($input: FinalizeUserInput!) {\n    finalizeUser(input: $input) {\n      id\n      username\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      user {\n        id\n      }\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      user {\n        id\n      }\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResendVerificationMail($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation ResendVerificationMail($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBankgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateBankgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePlusgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePlusgiroPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserExists($input: UserExistsInput!) {\n    userExists(input: $input) {\n      registrationStatus\n    }\n  }\n"): (typeof documents)["\n  query UserExists($input: UserExistsInput!) {\n    userExists(input: $input) {\n      registrationStatus\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterUser($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRixPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateRixPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSwishPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSwishPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTrustlyPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n      trustlyUrl\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTrustlyPayoutAccount($input: CreatePayoutAccountInput!) {\n    createPayoutAccount(input: $input) {\n      user {\n        id\n        selectedPayoutMethod\n      }\n      trustlyUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EditProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"): (typeof documents)["\n  query EditProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProject($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProject($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PreviewProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n"): (typeof documents)["\n  query PreviewProjectQuery($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      description\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      description\n      description\n      contactName\n      contactEmail\n      contactPhone\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DeliveryQuer($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query DeliveryQuer($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeliveryUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        deliveryRadius\n        deliveryPrice\n        deliveryEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation DeliveryUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        deliveryRadius\n        deliveryPrice\n        deliveryEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      pickupEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      pickupEnabled\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePickup($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        pickupEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePickup($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        address\n        pickupEnabled\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        project {\n          id\n          title\n          address\n          location {\n            lat\n            lng\n          }\n          approximatePlace {\n            lat\n            lng\n            address\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PreviewPickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PreviewPickupQuery($input: GetProductInput!) {\n    product(input: $input) {\n      id\n      address\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ShippingQuery($input: GetProductInput!) {\n    getAllShippingPrices {\n      id\n      maxWeight\n      price\n      provider\n    }\n    product(input: $input) {\n      id\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n"): (typeof documents)["\n  query ShippingQuery($input: GetProductInput!) {\n    getAllShippingPrices {\n      id\n      maxWeight\n      price\n      provider\n    }\n    product(input: $input) {\n      id\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateShipping($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        shippingPrices {\n          id\n          maxWeight\n          price\n          provider\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateShipping($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        shippingPrices {\n          id\n          maxWeight\n          price\n          provider\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AppQuery($isLoggedIn: Boolean!) {\n    me @include(if: $isLoggedIn) {\n      id\n      registrationStatus\n    }\n  }\n"): (typeof documents)["\n  query AppQuery($isLoggedIn: Boolean!) {\n    me @include(if: $isLoggedIn) {\n      id\n      registrationStatus\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProductView($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      createdAt\n      updatedAt\n      canDelete\n      likedByMe\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        hasChildren\n        ancestorIds\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        projectPicture {\n          id\n          url\n        }\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        products {\n          id\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n      seller {\n        id\n        type\n        username\n        rating\n        numberOfPublishedProducts\n        numberOfSoldProducts\n        products {\n          id\n          title\n          likedByMe\n          primaryQuantity\n          primaryUnit\n          condition\n          price\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      address\n    }\n  }\n"): (typeof documents)["\n  query ProductView($input: GetProductInput!, $isLoggedIn: Boolean!) {\n    product(input: $input) {\n      id\n      createdAt\n      updatedAt\n      canDelete\n      likedByMe\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        hasChildren\n        ancestorIds\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        projectPicture {\n          id\n          url\n        }\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n        products {\n          id\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n      seller {\n        id\n        type\n        username\n        rating\n        numberOfPublishedProducts\n        numberOfSoldProducts\n        products {\n          id\n          title\n          likedByMe\n          primaryQuantity\n          primaryUnit\n          condition\n          price\n          primaryImage {\n            id\n            url\n          }\n        }\n      }\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      address\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByMe\n    }\n  }\n"): (typeof documents)["\n  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {\n    setLikeProduct(input: $input) {\n      id\n      likedByMe\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n"): (typeof documents)["\n  query LandingQuery {\n    me {\n      id\n      username\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AuthenticateRocker($input: AuthenticateRockerInput!) {\n    authenticateRocker(input: $input) {\n      status\n      qrCode\n      autoStartToken\n    }\n  }\n"): (typeof documents)["\n  mutation AuthenticateRocker($input: AuthenticateRockerInput!) {\n    authenticateRocker(input: $input) {\n      status\n      qrCode\n      autoStartToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Search($isLoggedIn: Boolean!, $searchResult: GetSearchResultsInput!) {\n    popularCategories {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n    getSearchResults(input: $searchResult) @include(if: $isLoggedIn) {\n      id\n      searchString\n      count\n    }\n    me @include(if: $isLoggedIn) {\n      id\n    }\n  }\n"): (typeof documents)["\n  query Search($isLoggedIn: Boolean!, $searchResult: GetSearchResultsInput!) {\n    popularCategories {\n      id\n      name\n      image {\n        id\n        url\n      }\n    }\n    getSearchResults(input: $searchResult) @include(if: $isLoggedIn) {\n      id\n      searchString\n      count\n    }\n    me @include(if: $isLoggedIn) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DoSearch(\n    $searchResultsInput: GetSimilarSearchResultsInput!\n    $usersInput: GetUsersInput!\n  ) {\n    getSimilarSearchResults(input: $searchResultsInput) {\n      id\n      searchString\n      count\n    }\n    getUsers(input: $usersInput) {\n      id\n      username\n      type\n      numberOfPublishedProducts\n      numberOfSoldProducts\n      profilePicture {\n        id\n        url\n      }\n    }\n  }\n"): (typeof documents)["\n  query DoSearch(\n    $searchResultsInput: GetSimilarSearchResultsInput!\n    $usersInput: GetUsersInput!\n  ) {\n    getSimilarSearchResults(input: $searchResultsInput) {\n      id\n      searchString\n      count\n    }\n    getUsers(input: $usersInput) {\n      id\n      username\n      type\n      numberOfPublishedProducts\n      numberOfSoldProducts\n      profilePicture {\n        id\n        url\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ClearSearchHistory {\n    clearSearchHistory\n  }\n"): (typeof documents)["\n  mutation ClearSearchHistory {\n    clearSearchHistory\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSearchResult($input: CreateSearchResultInput!) {\n    createSearchResult(input: $input) {\n      id\n      searchString\n      count\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSearchResult($input: CreateSearchResultInput!) {\n    createSearchResult(input: $input) {\n      id\n      searchString\n      count\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchProducts(\n    $input: ProductsInput!\n    $limit: Int\n    $offset: Int\n    $isLoggedIn: Boolean!\n  ) {\n    products(input: $input, limit: $limit, offset: $offset) {\n      products {\n        id\n        title\n        price\n        condition\n        primaryQuantity\n        primaryUnit\n        likedByMe\n        brand {\n          id\n          name\n        }\n        primaryImage {\n          id\n          url\n        }\n        approximatePlace {\n          address\n        }\n        seller {\n          id\n          type\n          rating\n        }\n      }\n      total\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      location {\n        lat\n        lng\n      }\n      address\n    }\n  }\n"): (typeof documents)["\n  query SearchProducts(\n    $input: ProductsInput!\n    $limit: Int\n    $offset: Int\n    $isLoggedIn: Boolean!\n  ) {\n    products(input: $input, limit: $limit, offset: $offset) {\n      products {\n        id\n        title\n        price\n        condition\n        primaryQuantity\n        primaryUnit\n        likedByMe\n        brand {\n          id\n          name\n        }\n        primaryImage {\n          id\n          url\n        }\n        approximatePlace {\n          address\n        }\n        seller {\n          id\n          type\n          rating\n        }\n      }\n      total\n    }\n    me @include(if: $isLoggedIn) {\n      id\n      location {\n        lat\n        lng\n      }\n      address\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation NewPassword($input: NewPasswordInput!) {\n    newPassword(input:$input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductDetailsFragment on Product {\n    id\n    title\n    description\n    price\n    isGiveaway\n    condition\n    primaryQuantity\n    primaryUnit\n    secondaryQuantity\n    secondaryUnit\n    height\n    width\n    length\n    thickness\n    diameter\n    weight\n    images {\n      id\n      mimeType\n      url\n      name\n    }\n    documents {\n      id\n      mimeType\n      url\n      name\n    }\n    category {\n      id\n      name\n      hasChildren\n      ancestorIds\n    }\n    brand {\n      id\n      type\n    }\n  }\n"): (typeof documents)["\n  fragment ProductDetailsFragment on Product {\n    id\n    title\n    description\n    price\n    isGiveaway\n    condition\n    primaryQuantity\n    primaryUnit\n    secondaryQuantity\n    secondaryUnit\n    height\n    width\n    length\n    thickness\n    diameter\n    weight\n    images {\n      id\n      mimeType\n      url\n      name\n    }\n    documents {\n      id\n      mimeType\n      url\n      name\n    }\n    category {\n      id\n      name\n      hasChildren\n      ancestorIds\n    }\n    brand {\n      id\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SellProductCreateDraft {\n    createDraftProduct {\n      ...ProductDetailsFragment\n    }\n  }\n  \n"): (typeof documents)["\n  mutation SellProductCreateDraft {\n    createDraftProduct {\n      ...ProductDetailsFragment\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SellProductQuery {\n    getDraftedProduct {\n      ...ProductDetailsFragment\n    }\n    me {\n      id\n      selectedPayoutMethod\n    }\n  }\n  \n"): (typeof documents)["\n  query SellProductQuery {\n    getDraftedProduct {\n      ...ProductDetailsFragment\n    }\n    me {\n      id\n      selectedPayoutMethod\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SellProductUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        ...ProductDetailsFragment\n      }\n      imagePutUrls\n      documentPutUrls\n    }\n  }\n  \n"): (typeof documents)["\n  mutation SellProductUpdate($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        ...ProductDetailsFragment\n      }\n      imagePutUrls\n      documentPutUrls\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TransportationQuery {\n    getDraftedProduct {\n      id\n      address\n      pickupEnabled\n      deliveryEnabled\n      deliveryPrice\n      deliveryRadius\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n"): (typeof documents)["\n  query TransportationQuery {\n    getDraftedProduct {\n      id\n      address\n      pickupEnabled\n      deliveryEnabled\n      deliveryPrice\n      deliveryRadius\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PreviewDraftedProduct {\n    getDraftedProduct {\n      id\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n    me {\n      id\n      address\n    }\n  }\n"): (typeof documents)["\n  query PreviewDraftedProduct {\n    getDraftedProduct {\n      id\n      title\n      description\n      price\n      isGiveaway\n      condition\n      primaryQuantity\n      primaryUnit\n      secondaryQuantity\n      secondaryUnit\n      height\n      width\n      length\n      thickness\n      diameter\n      weight\n      images {\n        id\n        mimeType\n        url\n        name\n      }\n      documents {\n        id\n        mimeType\n        url\n        name\n      }\n      category {\n        id\n        name\n        parent {\n          id\n          name\n        }\n      }\n      brand {\n        id\n        name\n        type\n      }\n      location {\n        lat\n        lng\n      }\n      approximatePlace {\n        lat\n        lng\n        address\n      }\n      project {\n        id\n        title\n        address\n        location {\n          lat\n          lng\n        }\n        approximatePlace {\n          lat\n          lng\n          address\n        }\n      }\n      pickupEnabled\n      deliveryRadius\n      deliveryPrice\n      deliveryEnabled\n      shippingPrices {\n        id\n        maxWeight\n        price\n        provider\n      }\n    }\n    me {\n      id\n      address\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PublishProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        status\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RootPayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n"): (typeof documents)["\n  query RootPayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n"): (typeof documents)["\n  query PayoutMethodQuery {\n    me {\n      id\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectGetMyProjects {\n    myProjects {\n      id\n      title\n    }\n    getDraftedProduct {\n      id\n      project {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProjectGetMyProjects {\n    myProjects {\n      id\n      title\n    }\n    getDraftedProduct {\n      id\n      project {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectGetProject($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProjectGetProject($input: GetProjectInput!) {\n    getProject(input: $input) {\n      id\n      title\n      contactName\n      contactEmail\n      contactPhone\n      address\n      location {\n        lat\n        lng\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ProjectUpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        project {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ProjectUpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      product {\n        id\n        project {\n          id\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;