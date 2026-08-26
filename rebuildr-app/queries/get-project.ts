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
      approximatePlace {
        lat
        lng
        address
      }
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
      # Only for the unfiltered "n annonser i projektet" count; the list itself
      # is fetched separately so it can be sorted and filtered.
      products {
        id
      }
    }
    me @include(if: $isLoggedIn) {
      id
      type
      isFeatured
    }
  }
`;
