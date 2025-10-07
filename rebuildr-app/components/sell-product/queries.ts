import { gql } from "@apollo/client";

export const SELL_PRODUCT_BOTTOM_SHEET_PRODUCT_FRAGMENT = gql`
  fragment SellProductBottomSheetProductFragment on Product {
    id
    title
    description
    price
    isGiveaway
    condition
    primaryQuantity
    primaryUnit
    secondaryQuantity
    secondaryUnit
    height
    width
    length
    thickness
    diameter
    weight
    status
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
    }
    brand {
      id
      type
    }
    minimumPrice

    noProject
    project {
      id
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
    deliveryRadius
    deliveryPrice
    deliveryEnabled

    shippingPrices {
      id
      maxWeight
      price
      provider
    }
  }
`;
