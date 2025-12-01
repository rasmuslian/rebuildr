import { gql } from "@apollo/client";

export const CONVERSATION_PRODUCT = gql`
  query ConversationProduct(
    $input: GetConversationInput!
    $getProductInput: GetProductInput!
    $latestPurchaseInput: LatestPurchaseInput!
  ) {
    getConversation(input: $input) {
      id
      message
      messageType
      createdAt
      images {
        id
        url
      }
      documents {
        id
        name
        url
      }
      sender {
        id
        type
        username
        profilePicture {
          id
          url
        }
      }
      receiver {
        id
        username
        profilePicture {
          id
          url
        }
      }
    }
    product(input: $getProductInput) {
      id
      title
      price
      status
      seller {
        id
        username
      }
      primaryImage {
        id
        url
      }
    }
    latestPurchase(input: $latestPurchaseInput) {
      id
      status
      paymentAcceptedAt
      shipmentBookedAt
      shipmentDeliveredAt
      deliveredAt
      failedAt
      approvedAt
      qrCodeUrl
      isShipping
      transportationMethod
      sellerRespondedAt
      reviews {
        id
        reviewerId
        revieweeId
      }
    }
    me {
      id
      username
      type
    }
  }
`;
