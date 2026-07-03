import { gql } from "@apollo/client";

export const MY_FAVORITES = gql`
  query MyFavorites($limit: Int, $offset: Int) {
    me {
      id
      likedProducts(limit: $limit, offset: $offset) {
        total
        products {
          id
          availability
          primaryImage {
            id
            url
          }
          title
          primaryQuantity
          condition
          likedByMe
          seller {
            id
            type
            rating
          }
          approximatePlace {
            address
          }
          price
          soldByQuantity
        }
      }
      likedProjects {
        id
        title
        projectPicture {
          id
          url
        }
        likedByMe
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
    }
  }
`;
