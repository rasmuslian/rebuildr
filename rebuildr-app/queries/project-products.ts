import { gql } from "@apollo/client";

export const PROJECT_PRODUCTS = gql`
  query ProjectProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
        availability
        title
        price
        soldByQuantity
        condition
        primaryQuantity
        primaryUnit
        likedByMe
        primaryImage {
          id
          url
        }
        approximatePlace {
          address
        }
      }
      total
    }
  }
`;
