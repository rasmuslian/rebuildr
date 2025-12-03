import { gql } from "@apollo/client";

export const SUB_CATEGORIES = gql`
  query SubCategories($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      description
      parent {
        id
        name
      }
      children {
        id
        name
        parentId
        image {
          id
          url
        }
      }
    }
  }
`;
