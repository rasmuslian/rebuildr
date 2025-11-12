import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
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
import { useCreateMessage } from "@hooks/conversation/use-create-message";
import { useMarkConversationAsRead } from "@hooks/conversation/use-mark-conversation-as-read";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useImageHandler } from "@hooks/use-image-handler";

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
  const [message, setMessage] = useState("");
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const { productId, userId: otherUserId } = useLocalSearchParams<{
    productId: string;
    userId: string;
  }>();

  const { loading: createMessageLoading, onCreateMessage } = useCreateMessage();
  const { onMarkConversationAsRead } = useMarkConversationAsRead();
  const { pickDocument } = useDocumentHandler();
  const { pickImage } = useImageHandler();

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

  const onSendMessage = (input: {
    message: string;
    images?: { mimeType: string; file: File }[];
    documents?: { mimeType: string; file: File; name: string }[];
  }) => {
    if (createMessageLoading) {
      return;
    }

    onCreateMessage({
      receiverId: otherUserId,
      productId,
      ...input,
      onCompleted: () => {
        refetch();
        setMessage("");
      },
    });
  };

  const onPickImage = async () => {
    const image = await pickImage();
    if (!image) return;
    onSendMessage({
      message,
      images: [{ mimeType: image.mimeType, file: image.file }],
    });
  };

  const onPickDocument = async () => {
    const document = await pickDocument();
    if (!document) return;

    onSendMessage({
      message,
      documents: [
        {
          mimeType: document.mimeType,
          file: document.file,
          name: document.name,
        },
      ],
    });
  };

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
          <TextInput
            value={message}
            onChange={setMessage}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "Enter") {
                onSendMessage({ message });
              }
            }}
            trailing={[
              { icon: "paperclip", onPress: onPickDocument },
              {
                icon: "addPhoto",
                onPress: onPickImage,
              },
            ]}
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
