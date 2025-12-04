import { gql } from "@apollo/client";

export const MAP_PINS_QUERY = gql`
  query MapPins($input: ProductMapPinsBoxLocationInput!) {
    productMapPinsInBoundingBox(input: $input) {
      total
      pins {
        prices
        type
        productIds
        location {
          lat
          lng
        }
      }
    }
  }
`;

export const MAP_PRODUCT_QUERY = gql`
  query MapProduct($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      condition
      primaryQuantity
      primaryUnit
      price
      likedByMe
      sellerId
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
