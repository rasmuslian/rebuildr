import { gql } from "@apollo/client";

export const INTERNAL_AD_CARD_FIELDS = gql`
  fragment InternalAdCardFields on Product {
    id
    title
    description
    additionalInfo
    price
    status
    availability
    publiclyAvailable
    estimatedAvailableAt
    availabilityPrecision
    primaryQuantity
    primaryUnit
    condition
    soldByQuantity
    internalValidationIssues
    primaryImage {
      id
      url
    }
    brand {
      id
      name
    }
    category {
      id
      name
    }
  }
`;

export const INTERNAL_ADS_PAGE_QUERY = gql`
  query InternalAdsPage($input: ProductsInput!, $limit: Int, $offset: Int) {
    internalAdsOrganizationContext {
      organization {
        id
        name
        username
        internalAdsAccess
      }
      canReceivePayout
    }
    internalAds(input: $input, limit: $limit, offset: $offset) {
      products {
        ...InternalAdCardFields
      }
      total
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const INTERNAL_ADS_HOME_QUERY = gql`
  query InternalAdsHome($limit: Int) {
    internalAdsOrganizationContext {
      canReceivePayout
      organization {
        id
      }
    }
    internalAdsStatistics {
      co2Saved
      potentialCo2Savings
      estimatedMarketValue
      totalAds
      externallyPublishedAds
    }
    internalAdsCategories {
      category {
        id
        name
        image {
          url
        }
      }
    }
    internalAds(input: {}, limit: $limit, offset: 0) {
      products {
        id
        title
        price
        status
        availability
        publiclyAvailable
        primaryQuantity
        primaryUnit
        condition
        soldByQuantity
        primaryImage {
          url
        }
      }
    }
    availableNow: internalAds(
      input: { availability: AVAILABLE }
      limit: $limit
      offset: 0
    ) {
      products {
        id
        title
        price
        status
        availability
        publiclyAvailable
        primaryQuantity
        primaryUnit
        condition
        soldByQuantity
        primaryImage {
          url
        }
      }
    }
    upcoming: internalAds(
      input: { availability: UPCOMING }
      limit: $limit
      offset: 0
    ) {
      products {
        id
        title
        price
        status
        availability
        publiclyAvailable
        primaryQuantity
        primaryUnit
        condition
        soldByQuantity
        primaryImage {
          url
        }
      }
    }
    externallyPublished: internalAds(
      input: { publiclyAvailable: true }
      limit: $limit
      offset: 0
    ) {
      products {
        id
        title
        price
        status
        availability
        publiclyAvailable
        primaryQuantity
        primaryUnit
        condition
        soldByQuantity
        primaryImage {
          url
        }
      }
    }
  }
`;

export const INTERNAL_ADS_SEARCH = gql`
  query InternalAdsSearch($input: ProductsInput!) {
    internalAds(input: $input, limit: 5, offset: 0) {
      total
      products {
        ...InternalAdCardFields
      }
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const RELATED_INTERNAL_ADS = gql`
  query RelatedInternalAds(
    $input: ProductsInput!
    $excludeProductIds: [ID!]
    $limit: Int
    $offset: Int
  ) {
    relatedInternalAds(
      input: $input
      excludeProductIds: $excludeProductIds
      limit: $limit
      offset: $offset
    ) {
      products {
        ...InternalAdCardFields
      }
      total
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const INTERNAL_AD_MAP_PIN_GROUPS = gql`
  query InternalAdMapPinGroups($input: MapPinGroupsInput!) {
    internalAdMapPinGroups(input: $input) {
      mapPinGroups {
        location {
          lat
          lng
        }
        prices
        type
        productIds
        projectId
      }
      total
    }
  }
`;

export const INTERNAL_AD_MAP_POPUP = gql`
  query InternalAdMapPopup($productId: String!) {
    internalAd(productId: $productId) {
      ...InternalAdCardFields
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const CREATE_INTERNAL_AD_DRAFT = gql`
  mutation CreateInternalAdDraft { createInternalAdDraft { id } }
`;

export const SET_INTERNAL_AD_RESPONSIBLE_MEMBER = gql`
  mutation SetInternalAdResponsibleMember($productId: ID!, $organizationMemberId: ID!) {
    setInternalAdResponsibleMember(productId: $productId, organizationMemberId: $organizationMemberId) { id }
  }
`;

export const REMOVE_INTERNAL_AD_DRAFT = gql`
  mutation RemoveInternalAdDraft($productId: String!) {
    removeInternalAdDraft(productId: $productId)
  }
`;

export const REMOVE_INTERNAL_AD_IMPORT_BATCH = gql`
  mutation RemoveInternalAdImportBatch($batchId: String!) {
    removeInternalAdImportBatch(batchId: $batchId)
  }
`;

export const PUBLISH_INTERNAL_AD_DRAFTS = gql`
  mutation PublishInternalAdDrafts($productIds: [ID!]!) {
    publishInternalAdDrafts(productIds: $productIds) {
      ...InternalAdCardFields
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const CREATE_INTERNAL_AD_IMPORT_BATCH = gql`
  mutation CreateInternalAdImportBatch(
    $input: CreateInternalAdImportBatchInput!
    $organizationMemberId: ID!
  ) {
    createInternalAdImportBatch(input: $input, organizationMemberId: $organizationMemberId) {
      uploadUrls
      batch {
        id
        status
        progress
      }
    }
  }
`;

export const START_INTERNAL_AD_IMPORT_BATCH = gql`
  mutation StartInternalAdImportBatch($batchId: String!) {
    startInternalAdImportBatch(batchId: $batchId) {
      id
      status
      progress
      errorMessage
    }
  }
`;

export const INTERNAL_AD_IMPORT_BATCH = gql`
  query InternalAdImportBatch($batchId: String!) {
    internalAdImportBatch(batchId: $batchId) {
      id
      status
      progress
      errorMessage
      products {
        ...InternalAdCardFields
      }
    }
  }
  ${INTERNAL_AD_CARD_FIELDS}
`;

export const INTERNAL_AD_DETAIL = gql`
  query InternalAdDetail($productId: String!) {
    internalAdsOrganizationContext {
      canReceivePayout
      organization {
        id
        name
      }
    }
    internalAd(productId: $productId) {
      id
      title
      description
      additionalInfo
      internalReferenceNumber
      status
      availability
      estimatedAvailableAt
      availabilityPrecision
      condition
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      soldByQuantity
      internalValidationIssues
      createdByOrganizationMemberId
      createdByOrganizationMemberName
      createdByOrganizationMemberEmail
      price
      priceSuggestionMin
      priceSuggestionMax
      publiclyAvailable
      publicPriceConfirmed
      images {
        id
        url
        mimeType
        name
      }
      documents {
        id
        url
        mimeType
        name
      }
      brand {
        id
        name
      }
      category {
        id
        name
        parent {
          id
          name
        }
      }
      address
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      pickupEnabled
      deliveryEnabled
      deliveryRadius
      deliveryPrice
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
      internalReservations {
        id
        quantity
        reservedAt
        canceledAt
        soldAt
        reservedByOrganizationMemberId
        reservedByOrganizationMemberName
        reservedByOrganizationMemberEmail
      }
    }
    me {
      id
    }
  }
`;

export const SET_INTERNAL_AD_PUBLIC_AVAILABILITY = gql`
  mutation SetInternalAdPublicAvailability(
    $productId: String!
    $publiclyAvailable: Boolean!
    $price: Float
  ) {
    setInternalAdPublicAvailability(
      productId: $productId
      publiclyAvailable: $publiclyAvailable
      price: $price
    ) {
      id
      price
      publiclyAvailable
      publicPriceConfirmed
    }
  }
`;

export const RESERVE_INTERNAL_AD = gql`
  mutation ReserveInternalAd($input: ReserveInternalAdInput!) {
    reserveInternalAd(input: $input) {
      id
    }
  }
`;

export const CANCEL_INTERNAL_AD_RESERVATION = gql`
  mutation CancelInternalAdReservation($reservationId: String!) {
    cancelInternalAdReservation(reservationId: $reservationId) {
      id
      canceledAt
    }
  }
`;

export const MARK_INTERNAL_AD_SOLD = gql`
  mutation MarkInternalAdSold($input: MarkInternalAdSoldInput!) {
    markInternalAdSold(input: $input) {
      id
      status
      primaryQuantity
    }
  }
`;

export const INTERNAL_ADS_MENU_CONTEXT = gql`
  query InternalAdsMenuContext {
    internalAdsOrganizationContext {
      canReceivePayout
      organization {
        id
      }
    }
  }
`;
