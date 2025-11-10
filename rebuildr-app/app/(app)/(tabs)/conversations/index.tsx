import {
  GetConversationsQuery,
  GetConversationsQueryVariables,
  GetConversationsType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useState } from "react";
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
  const [tab, setTab] = useState<"sell" | "buy">("sell");
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

  const { totalUnread, nrUnreadBuy, nrUnreadSell, unread, read } =
    parseConversations(data, tab);

  if (isDesktop) {
    return (
      <ConversationsDesktop
        totalUnread={totalUnread}
        nrUnreadSell={nrUnreadSell}
        nrUnreadBuy={nrUnreadBuy}
        tab={tab}
        setTab={setTab}
        unread={unread}
        read={read}
        myId={data.me.id}
      />
    );
  }

  return (
    <ConversationsMobile
      totalUnread={totalUnread}
      nrUnreadSell={nrUnreadSell}
      nrUnreadBuy={nrUnreadBuy}
      tab={tab}
      setTab={setTab}
      unread={unread}
      read={read}
      myId={data.me.id}
    />
  );
}

const parseConversations = (
  data: GetConversationsQuery,
  tab: "sell" | "buy",
) => {
  const totalUnread = data.getConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const buyConversations = data.getConversations.filter(
    (convo) => convo.product.seller.id !== data.me.id,
  );
  const nrUnreadBuy = buyConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const sellConversations = data.getConversations.filter(
    (convo) => convo.product.seller.id === data.me.id,
  );
  const nrUnreadSell = sellConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const conversations = tab === "buy" ? buyConversations : sellConversations;
  const conversationsPerProduct = conversations.reduce(
    (
      acc: {
        productId: string;
        conversations: GetConversationsQuery["getConversations"];
      }[],
      curr,
    ) => {
      const existingIndex = acc.findIndex(
        (group) => group.productId === curr.product.id,
      );
      if (existingIndex !== -1) {
        //Return a new array with an updated 'conversastions' field on the existing
        //index where 'productId' matched
        return acc.toSpliced(existingIndex, 1, {
          productId: acc[existingIndex].productId,
          conversations: [...acc[existingIndex].conversations, curr],
        });
      }
      return [...acc, { productId: curr.product.id, conversations: [curr] }];
    },
    [],
  );
  const unread = conversationsPerProduct.filter((group) =>
    group.conversations.some((convo) => {
      return convo.sender.id !== data.me.id && !convo.readAt;
    }),
  );
  const read = conversationsPerProduct.filter((group) =>
    group.conversations.every(
      (convo) => convo.sender.id === data.me.id || !!convo.readAt,
    ),
  );

  return {
    totalUnread,
    nrUnreadBuy,
    nrUnreadSell,
    unread,
    read,
  };
};
