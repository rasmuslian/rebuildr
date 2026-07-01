import { gql } from "@apollo/client";

export const INTERNAL_AD_CARD_FIELDS = gql`
  fragment InternalAdCardFields on Product {
    id
    title
    price
    status
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
      role
      isOrganizationAccount
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

export const CREATE_INTERNAL_AD_DRAFT = gql`
  mutation CreateInternalAdDraft {
    createInternalAdDraft {
      id
    }
  }
`;

export const REMOVE_INTERNAL_AD_DRAFT = gql`
  mutation RemoveInternalAdDraft($productId: String!) {
    removeInternalAdDraft(productId: $productId)
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
  ) {
    createInternalAdImportBatch(input: $input) {
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

export const INVITE_ORGANIZATION_MEMBER = gql`
  mutation InviteOrganizationMember($input: InviteOrganizationMemberInput!) {
    inviteOrganizationMember(input: $input) {
      id
      email
      role
      status
      createdAt
    }
  }
`;

export const ORGANIZATION_MEMBERS_PAGE = gql`
  query OrganizationMembersPage {
    internalAdsOrganizationContext {
      organization {
        id
        name
        username
      }
      role
    }
    organizationMembers {
      id
      role
      user {
        id
        name
        username
        email
      }
    }
    organizationInvites {
      id
      email
      role
      status
      createdAt
    }
  }
`;

export const UPDATE_ORGANIZATION_MEMBER_ROLE = gql`
  mutation UpdateOrganizationMemberRole(
    $input: UpdateOrganizationMemberRoleInput!
  ) {
    updateOrganizationMemberRole(input: $input) {
      id
      role
      user {
        id
        name
        username
        email
      }
    }
  }
`;

export const INTERNAL_AD_DETAIL = gql`
  query InternalAdDetail($productId: String!) {
    internalAdsOrganizationContext {
      role
      organization {
        id
      }
    }
    internalAd(productId: $productId) {
      id
      title
      description
      additionalInfo
      status
      condition
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      soldByQuantity
      internalValidationIssues
      createdByUserId
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
      approximatePlace {
        address
      }
      internalReservations {
        id
        quantity
        reservedAt
        canceledAt
        soldAt
        reservedByUserId
        reservedByUser {
          id
          name
          username
          email
        }
      }
    }
    me {
      id
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

export const ACCEPT_ORGANIZATION_INVITE = gql`
  mutation AcceptOrganizationInvite($input: AcceptOrganizationInviteInput!) {
    acceptOrganizationInvite(input: $input) {
      id
      username
      email
    }
  }
`;

export const INTERNAL_ADS_MENU_CONTEXT = gql`
  query InternalAdsMenuContext {
    internalAdsOrganizationContext {
      role
      organization {
        id
      }
    }
  }
`;
