import { TAB_LAYOUT } from "@/app/(app)/(tabs)/_layout";
import {
  ConversationQuery,
  ConversationQueryVariables,
  Product,
  Purchase,
  User,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { ChatActionButtons } from "@components/conversations/chat-action-buttons";
import { Conversation } from "@components/conversations/conversation";
import { MessageInput } from "@components/conversations/message-input";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useMarkConversationAsRead } from "@hooks/conversation/use-mark-conversation-as-read";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { PRODUCT_CONVERSATIONS } from "../conversations/[productId]";
import { ChatHeader } from "@components/conversations/chat-header";
import { useScreenType } from "@hooks/useScreenType";

export const CONVERSATION = gql`
  query Conversation($input: GetConversationInput!) {
    getConversation(input: $input) {
      id
      product {
        id
        title
        price
        soldByQuantity
        primaryQuantity
        primaryUnit
        condition
        status
        primaryImage {
          id
          url
        }
        seller {
          id
          username
        }
      }
      purchase {
        id
        status
        purchasedQuantity
        paymentAcceptedAt
        shipmentBookedAt
        shipmentDeliveredAt
        deliveredAt
        failedAt
        approvedAt
        qrCodeUrl
        qrCodeContent
        isShipping
        transportationMethod
        sellerRespondedAt
        canAbort {
          deniedReason
        }
        reviews {
          id
          reviewerId
          revieweeId
        }
      }

      buyer {
        id
        username
      }

      messages {
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
      }
    }
    me {
      id
      type
    }
  }
`;

export default function ConversationProduct() {
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const { isDesktop } = useScreenType();

  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const { data, refetch } = useQuery<
    ConversationQuery,
    ConversationQueryVariables
  >(CONVERSATION, {
    variables: {
      input: {
        id: conversationId,
      },
    },
    onCompleted(data) {
      onMarkConversationAsRead({
        conversationId,
        refetchQueries: [TAB_LAYOUT, PRODUCT_CONVERSATIONS],
      });
    },
  });

  const { onMarkConversationAsRead } = useMarkConversationAsRead();

  const sellerIsMe = data?.me.id === data?.getConversation.product.seller.id;

  if (!data) {
    return <LoadingSpinner />;
  }

  const otherUser = sellerIsMe
    ? data.getConversation.buyer
    : data.getConversation.product.seller;

  if (isDesktop && data) {
    router.replace({
      pathname: "/conversations/[productId]",
      params: { productId: data.getConversation.product.id },
    });
  }

  return (
    <ScreenLayout
      onContentSizeChange="scrollToBottom"
      headerComponent={
        <ChatHeader
          otherUser={otherUser as User}
          sellerIsMe={sellerIsMe}
          product={data.getConversation.product as Product}
          purchase={
            data.getConversation.purchase as Purchase | undefined | null
          }
        />
      }
      footerBottomMargin="small"
      footerComponent={
        <View style={{ gap: 16 }}>
          <Divider />
          <ChatActionButtons
            product={data.getConversation.product as Product}
            purchase={
              data.getConversation.purchase as Purchase | undefined | null
            }
            me={data.me as User}
            onShowReview={() => setShowReviewSheet(true)}
            onShowQRCode={() => {
              if (!data.getConversation.purchase) {
                return;
              }
              router.navigate({
                pathname: "/account/sales/shipping-code",
                params: { purchaseId: data.getConversation.purchase.id },
              });
            }}
          />
          <MessageInput
            conversationId={conversationId}
            productId={data.getConversation.product.id}
            onMessageSent={() => refetch()}
          />
        </View>
      }
    >
      <Conversation
        data={data}
        refetch={refetch}
        showReviewSheet={showReviewSheet}
        setShowReviewSheet={setShowReviewSheet}
      />
    </ScreenLayout>
  );
}
