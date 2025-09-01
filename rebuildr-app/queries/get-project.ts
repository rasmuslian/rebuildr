import { gql } from "@apollo/client";

export const GET_PROJECT = gql`
  query GetProject($input: GetProjectInput!, $isLoggedIn: Boolean!) {
    getProject(input: $input) {
      id
      title
      description
      contactName
      description
      contactEmail
      contactPhone
      address
      likedByMe
      projectPicture {
        id
        url
      }
      user {
        id
        username
        type
        rating
        profilePicture {
          id
          url
        }
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
        category {
          id
          name
        }
        approximatePlace {
          address
        }
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;
