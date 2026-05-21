import { gql } from "@apollo/client";

export const PROFILE = gql`
  query Profile($input: GetUserInput!, $isLoggedIn: Boolean!) {
    user(input: $input) {
      id
      username
      description
      type
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      projects {
        id
        title
        likedByMe
        projectPicture {
          id
          url
        }
        products {
          id
          status
          primaryImage {
            id
            url
          }
        }
        user {
          id
          profilePicture {
            id
            url
          }
        }
      }
      profilePicture {
        id
        url
      }
      reviewed {
        id
        createdAt
        review
        stars
        purchase {
          id
          buyerId
        }
        reviewer {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
      totalCO2Savings
      totalCO2SavingsBuyer
      totalCO2SavingsSeller
      numberOfCompletedPurchases
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

export const PROFILE_PRODUCTS = gql`
  query ProfileProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
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

export const PROFILE_UPDATE_USER = gql`
  mutation ProfileUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        description
        profilePicture {
          id
          url
        }
      }
      profilePicturePutUrl
    }
  }
`;
