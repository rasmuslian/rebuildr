import { gql } from "@apollo/client";

export const PRODUCT_VIEW_FRAGMENT = gql`
  fragment ProductViewFragment on Product {
    id
    status
    createdAt
    updatedAt
    canDelete
    likedByMe
    title
    description
    additionalInfo
    price
    isGiveaway
    condition
    primaryQuantity
    primaryUnit
    secondaryQuantity
    secondaryUnit
    height
    heightUnit
    width
    widthUnit
    length
    lengthUnit
    thickness
    thicknessUnit
    diameter
    diameterUnit
    weight
    weightUnit
    color
    colorType
    co2Saving
    hasOngoingPurchase(includeOwnPurchases: true)
    images {
      id
      mimeType
      url
      name
    }
    documents {
      id
      mimeType
      url
      name
    }
    category {
      id
      name
      hasChildren
      ancestorIds
      parent {
        id
        name
      }
    }
    brand {
      id
      name
      type
    }
    location {
      lat
      lng
    }
    approximatePlace {
      lat
      lng
      address
    }
    project {
      id
      title
      address
      likedByMe
      projectPicture {
        id
        url
      }
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      products {
        id
        status
        primaryImage {
          id
          url
        }
      }
      user {
        id
        profilePicture {
          id
          url
        }
      }
    }
    pickupEnabled
    deliveryRadius
    deliveryPrice
    deliveryEnabled
    shippingPrices {
      id
      maxWeight
      price
      provider
    }
    seller {
      id
      type
      username
      rating
      numberOfPublishedProducts
      numberOfSoldProducts
      profilePicture {
        id
        url
      }
      products {
        id
        title
        status
        likedByMe
        primaryQuantity
        primaryUnit
        condition
        price
        primaryImage {
          id
          url
        }
      }
    }
  }
`;
