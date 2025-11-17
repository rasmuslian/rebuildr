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

const GET_CONVERSATIONS = gql`
  query getConversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      message
      readAt
      createdAt
      messageType
      sender {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
      receiver {
        id
        username
        type
        profilePicture {
          id
          url
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
        primaryImage {
          id
          url
        }
        seller {
          id
          username
          profilePicture {
            id
            url
          }
        }
      }
    }
    me {
      id
    }
  }
`;

export default function Conversations() {
  const { isDesktop } = useScreenType();

  const { data } = useQuery<
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
    return <ConversationsDesktop data={data} myId={data.me.id} />;
  }

  return <ConversationsMobile data={data} myId={data.me.id} />;
}
