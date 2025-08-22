import { gql } from "@apollo/client";

export const SUB_CATEGORIES = gql`
  query SubCategories(
    $categoryInput: CategoryInput!
    $getCategoriesInput: GetCategoriesInput!
  ) {
    category(input: $categoryInput) {
      id
      name
      description
    }
    getCategories(input: $getCategoriesInput) {
      id
      name
      description
      image {
        id
        url
      }
    }
  }
`;
