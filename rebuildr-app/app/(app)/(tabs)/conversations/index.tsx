import {
  GetConversationsQuery,
  GetConversationsQueryVariables,
  GetConversationsType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useScreenType } from "@hooks/useScreenType";
import { ConversationsMobile } from "@components/conversations/conversations.mobile";
import { ConversationsDesktop } from "@components/conversations/conversations.desktop";

export const GET_CONVERSATIONS = gql`
  query getConversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      createdAt
      buyerId
      buyerReadAt
      sellerReadAt
      buyer {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
      lastMessage {
        createdAt
        messageType
        message
        sender {
          id
          username
        }
      }
      product {
        id
        title
        status
        primaryQuantity
        primaryUnit
        condition
        price
        soldByQuantity
        primaryImage {
          id
          url
        }
        sellerId
        seller {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
      purchase {
        purchasedQuantity
      }
    }
    me {
      id
    }
  }
`;

export default function Conversations() {
  const { isDesktop } = useScreenType();

  const { data, refetch } = useQuery<
    GetConversationsQuery,
    GetConversationsQueryVariables
  >(GET_CONVERSATIONS, {
    variables: {
      input: {
        type: GetConversationsType.BuyingAndSelling,
      },
    },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  if (isDesktop) {
    return (
      <ConversationsDesktop data={data} myId={data.me.id} refetch={refetch} />
    );
  }

  return <ConversationsMobile data={data} myId={data.me.id} />;
}
