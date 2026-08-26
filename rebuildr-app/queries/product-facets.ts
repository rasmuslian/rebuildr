import { gql } from "@apollo/client";

export const PRODUCT_FACETS = gql`
  query ProductFacets($input: ProductsInput!) {
    productFacets(input: $input) {
      categories {
        id
        count
      }
      rootCategories {
        id
        count
      }
      brands {
        id
        count
      }
      conditions {
        id
        count
      }
    }
  }
`;
