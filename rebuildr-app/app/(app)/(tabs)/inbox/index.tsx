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
import { Icon } from "@icons/icon";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import dayjs from "dayjs";
import { router } from "expo-router";

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
        profilePicture {
          id
          url
        }
      }
      product {
        id
        title
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

export default function Inbox() {
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

  const renderCards = (
    conversationGroup: {
      productId: string;
      conversations: GetConversationsQuery["getConversations"];
    }[],
  ) => {
    return conversationGroup.map((conversationsGroup, i) => {
      const product = conversationsGroup.conversations[0].product;
      const sortedByLatest = conversationsGroup.conversations.sort((a, b) =>
        dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1,
      );
      return (
        <ProductMessageCard
          key={i}
          adList={{
            title: product.title,
            quantity: product.primaryQuantity ?? 0,
            quantityUnit: product.primaryUnit ?? undefined,
            condition: product.condition,
            price: product.price,
            imageUrl: product.primaryImage?.url,
          }}
          messages={sortedByLatest.map((conversation) => ({
            sender: {
              senderIsMe: conversation.sender.id === data.me.id,
              username: conversation.sender.username ?? "",
              url: conversation.sender.profilePicture?.url,
            },
            message: conversation.message,
            createdAt: conversation.createdAt,
            readAt: conversation.readAt,
          }))}
          onPress={() =>
            tab === "buy"
              ? {
                  /**TODO: Navigate to chat*/
                }
              : router.navigate({
                  pathname: "/inbox/conversations",
                  params: { productId: conversationsGroup.productId },
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
      <Display size="small">Du har {totalUnread} olästa</Display>
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
            ? `Köper: ${nrUnreadBuy} Olästa`
            : `Säljer: ${nrUnreadSell} Olästa`}
        </Headline>
        {unread.length ? (
          <View style={{ marginTop: 24 }}>{renderCards(unread)}</View>
        ) : (
          <Body size="medium" color="secondary" style={{ marginTop: 2 }}>
            Härligt! Du har läst alla meddelanden.
          </Body>
        )}
      </View>
      <Divider />
      {read.length ? (
        <>
          <Pressable onPress={() => setShowAll(!showAll)}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Headline size="small">
                {tab === "buy"
                  ? "Köper: Alla meddelanden"
                  : "Säljer: Alla meddelanden"}
              </Headline>
              <Icon icon={showAll ? "chevronUp" : "chevronDown"} size={18} />
            </View>
          </Pressable>
          {showAll && <View style={{ gap: 16 }}>{renderCards(read)}</View>}
        </>
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
