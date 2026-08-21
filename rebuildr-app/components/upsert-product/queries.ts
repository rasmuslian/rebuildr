import { gql } from "@apollo/client";

export const UPSERT_PRODUCT_PRODUCT_FRAGMENT = gql`
  fragment UpsertProductProductFragment on Product {
    id
    title
    description
    additionalInfo
    internalReferenceNumber
    price
    isGiveaway
    soldByQuantity
    priceSuggestionMin
    priceSuggestionMax
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
    status
    availability
    estimatedAvailableAt
    availabilityPrecision
    availableUntil
    availableUntil
    co2SavingSeller
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

export const EXACT_AND_APPROXIMATE_PLACE = gql`
  query ExactAndApproximatePlace($input: LocationInputType!) {
    exactAndApproximatePlace(input: $input) {
      exact {
        lat
        lng
        address
      }
      approximate {
        lat
        lng
        address
      }
    }
  }
`;
