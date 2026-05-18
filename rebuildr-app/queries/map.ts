import { gql } from "@apollo/client";

export const MAP_PIN_GROUPS = gql`
  query MapPinGroups($input: MapPinGroupsInput!) {
    mapPinGroups(input: $input) {
      total
      mapPinGroups {
        prices
        type
        productIds
        projectId
        location {
          lat
          lng
        }
      }
    }
  }
`;

export const ACTIVE_PRODUCT_POPUP = gql`
  query ActiveProductPopup($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      condition
      primaryQuantity
      primaryUnit
      price
      soldByQuantity
      likedByMe
      sellerId
      seller {
        id
        rating
        profilePicture {
          id
          url
        }
      }
      approximatePlace {
        address
      }
      primaryImage {
        id
        url
      }
      project {
        id
        title
      }
    }
  }
`;
export const ACTIVE_PROJECT_POPUP = gql`
  query ActiveProjectPopup($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      description
      shortText
      showDetailsOnMap
      user {
        id
        profilePicture {
          id
          url
        }
      }
    }
  }
`;
