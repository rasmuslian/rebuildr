import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import {
  ConversationProductQuery,
  ConversationProductQueryVariables,
} from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { TAB_LAYOUT } from "@/app/(app)/(tabs)/_layout";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { ChatActionButtons } from "@components/conversations/chat-action-buttons";
import { Conversation } from "@components/conversations/conversation";
import { useMarkConversationAsRead } from "@hooks/conversation/use-mark-conversation-as-read";
import { MessageInput } from "@components/conversations/message-input";

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
    }
  }
`;

export default function ConversationProduct() {
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const { productId, userId: otherUserId } = useLocalSearchParams<{
    productId: string;
    userId: string;
  }>();

  const { onMarkConversationAsRead } = useMarkConversationAsRead();

  const { data, refetch } = useQuery<
    ConversationProductQuery,
    ConversationProductQueryVariables
  >(CONVERSATION_PRODUCT, {
    variables: {
      input: {
        productId,
        otherUserId,
      },
      getProductInput: { id: productId },
      latestPurchaseInput: { otherUserId, productId },
    },
    onCompleted(data) {
      const sellerId = data.product.seller.id;
      const buyerId = sellerId === otherUserId ? data.me.id : otherUserId;

      onMarkConversationAsRead({
        otherUserId: data.me.id === sellerId ? buyerId : sellerId,
        productId: data.product.id,
        refetchQueries: [TAB_LAYOUT],
      });
    },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  const sellerIsMe = data.me.id === data.product.seller.id;

  const statusBadgeProps = getProductBadgeProps(
    data.product.status,
    sellerIsMe ? "seller" : "buyer",
    data.latestPurchase,
  );

  const otherUser = data?.getConversation[0]
    ? data.getConversation[0].sender.id === data.me.id
      ? data.getConversation[0].receiver
      : data.getConversation[0].sender
    : data?.product.seller;

  return (
    <ScreenLayout
      onContentSizeChange="scrollToBottom"
      headerComponent={
        <View style={{ gap: 16 }}>
          <Header title={otherUser?.username} />
          <ProductHeader
            title={data.product.title}
            price={data.product.price}
            statusBadgeProps={statusBadgeProps}
            status={data.product.status}
            imageUrl={data.product.primaryImage?.url}
          />
        </View>
      }
      footerBottomMargin="small"
      footerComponent={
        <View style={{ gap: 16 }}>
          <Divider />
          <ChatActionButtons
            data={data}
            onShowReview={() => setShowReviewSheet(true)}
          />
          <MessageInput
            receiverId={otherUserId}
            productId={productId}
            onMessageSent={refetch}
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
