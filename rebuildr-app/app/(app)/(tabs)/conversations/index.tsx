import {
  GetConversationsQuery,
  GetConversationsQueryVariables,
  GetConversationsType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ProductMessageCard } from "@components/messages/product-message-card";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { TabRail } from "@components/tabs/tab-rail";
import { Body, Display, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import dayjs from "dayjs";
import { router } from "expo-router";
import { AccordionSection } from "@components/sections/accordion-section";

const GET_CONVERSATIONS = gql`
  query getConversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      message
      readAt
      createdAt
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
  const [showAll, setShowAll] = useState(true);

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

  const renderCards = (
    conversationsGroup: {
      productId: string;
      conversations: GetConversationsQuery["getConversations"];
    }[],
  ) => {
    return conversationsGroup.map((conversationGroup, i) => {
      const product = conversationGroup.conversations[0].product;
      const sortedByLatest = conversationGroup.conversations.sort((a, b) =>
        dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1,
      );
      const isMoreThanOneUser = sortedByLatest.length > 1;
      const firstConversation = sortedByLatest[0];

      return (
        <ProductMessageCard
          key={i}
          myId={data.me.id}
          adList={{
            title: product.title,
            status: product.status,
            quantity: product.primaryQuantity ?? 0,
            quantityUnit: product.primaryUnit ?? undefined,
            condition: product.condition,
            price: product.price,
            imageUrl: product.primaryImage?.url,
          }}
          messages={sortedByLatest.map((conversation) => ({
            sender: conversation.sender,
            receiver: conversation.receiver,
            message: conversation.message,
            createdAt: conversation.createdAt,
            readAt: conversation.readAt,
          }))}
          onPress={() =>
            //If there is only one user in the group, navigate directly to their conversation screen
            !isMoreThanOneUser
              ? router.navigate({
                  pathname: "/conversations/[productId]/[userId]",
                  params: {
                    productId: conversationGroup.productId,
                    userId:
                      firstConversation.sender.id === data.me.id
                        ? firstConversation.receiver.id
                        : firstConversation.sender.id,
                  },
                })
              : router.navigate({
                  pathname: "/conversations/[productId]",
                  params: { productId: conversationGroup.productId },
                })
          }
        />
      );
    });
  };

  return (
    <ScreenLayout
      headerComponent={<Header title="Inkorg" showBackButton={false} />}
      style={{ gap: 24 }}
    >
      <Display size="small">
        Du har {totalUnread} {totalUnread === 1 ? "oläst" : "olästa"}
      </Display>
      <TabRail
        tabs={[
          {
            title: "Säljer",
            onActivate: () => setTab("sell"),
            active: tab === "sell",
            ...(nrUnreadSell
              ? {
                  badge: {
                    text: nrUnreadSell.toString(),
                  },
                }
              : {}),
          },
          {
            title: "Köper",
            onActivate: () => setTab("buy"),
            active: tab === "buy",
            ...(nrUnreadBuy
              ? {
                  badge: {
                    text: nrUnreadBuy.toString(),
                  },
                }
              : {}),
          },
        ]}
      />
      <View>
        <Headline size="small">
          {tab === "buy"
            ? `Köper: ${nrUnreadBuy} ${nrUnreadSell === 1 ? "Oläst" : "Olästa"}`
            : `Säljer: ${nrUnreadSell} ${nrUnreadSell === 1 ? "Oläst" : "Olästa"}`}
        </Headline>
        {unread.length ? (
          <View style={{ marginTop: 24, gap: 16 }}>{renderCards(unread)}</View>
        ) : (
          <Body size="medium" color="secondary" style={{ marginTop: 2 }}>
            Härligt! Du har läst alla meddelanden.
          </Body>
        )}
      </View>
      <Divider />
      {read.length ? (
        <AccordionSection
          initialOpen
          title={
            tab === "buy"
              ? "Köper: Alla meddelanden"
              : "Säljer: Alla meddelanden"
          }
        >
          <View style={{ gap: 16 }}>{renderCards(read)}</View>
        </AccordionSection>
      ) : (
        <View style={{ gap: 2 }}>
          <Headline size="small">
            {tab === "buy"
              ? "Köper: Alla meddelanden"
              : "Säljer: Alla meddelanden"}
          </Headline>
          <Body size="medium" color="secondary">
            Här var det tomt.
          </Body>
        </View>
      )}
    </ScreenLayout>
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
