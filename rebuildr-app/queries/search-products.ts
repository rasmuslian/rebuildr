import { gql } from "@apollo/client";

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts(
    $input: ProductsInput!
    $limit: Int
    $offset: Int
    $isLoggedIn: Boolean!
    $distanceFrom: LocationInputType
  ) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        title
        status
        price
        condition
        primaryQuantity
        primaryUnit
        distanceFromLocation(location: $distanceFrom)
        likedByMe
        brand {
          id
          name
        }
        primaryImage {
          id
          url
        }
        approximatePlace {
          address
        }
        seller {
          id
          type
          rating
        }
      }
      total
    }
    me @include(if: $isLoggedIn) {
      id
      location {
        lat
        lng
      }
      address
    }
  }
`;
