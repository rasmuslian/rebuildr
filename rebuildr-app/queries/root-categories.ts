import { gql } from "@apollo/client";

export const ROOT_CATEGORIES = gql`
  query RootCategories($input: RootCategoriesInput!) {
    rootCategories(input: $input) {
      id
      name
      image {
        id
        url
      }
      children {
        id
        parentId
      }
    }
  }
`;
