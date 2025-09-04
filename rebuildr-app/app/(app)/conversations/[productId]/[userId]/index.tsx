import { Avatar } from "@components/avatar/avatar";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import dayjs from "dayjs";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { ReactNode, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  ConversationAcceptPurchaseMutation,
  ConversationAcceptPurchaseMutationVariables,
  ConversationMarkAsDeliveredMutation,
  ConversationMarkAsDeliveredMutationVariables,
  ConversationProductQuery,
  ConversationProductQueryVariables,
  CreateMessageMutation,
  CreateMessageMutationVariables,
  MarkConversationAsReadMutation,
  MarkConversationAsReadMutationVariables,
  MessageTypeEnum,
} from "@/gql/graphql";
import { SystemMessage } from "@components/messages/system-message";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { TAB_LAYOUT } from "@/app/(app)/(tabs)/_layout";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { AbortPurchaseBottomSheet } from "@components/abort-purchase/abort-purchase-bottom-sheet";
import { CreateReviewBottomSheet } from "@components/review/create-review-bottom-sheet";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { ReportPurchaseBottomSheet } from "@components/report/report-purchase-bottom-sheet";

const CONVERSATION_PRODUCT = gql`
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

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      message
      messageType
      createdAt
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
  }
`;

const MARK_CONVERSATION_AS_READ = gql`
  mutation MarkConversationAsRead($input: MarkAsReadInput!) {
    markConversationAsRead(input: $input) {
      id
      readAt
    }
  }
`;

const CONVERSATION_ACCEPT_PURCHASE = gql`
  mutation ConversationAcceptPurchase($input: AcceptPurchaseInput!) {
    acceptPurchase(input: $input) {
      id
      status
      approvedAt
    }
  }
`;

const CONVERSATION_MARK_AS_DELIVERED = gql`
  mutation ConversationMarkAsDelivered($input: MarkPurchaseAsDeliveredInput!) {
    markPurchaseAsDelivered(input: $input) {
      id
      status
      deliveredAt
    }
  }
`;

export default function ConversationProduct() {
  const [text, setText] = useState("");
  const [showAbortSheet, setShowAbortSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const { productId, userId: otherUserId } = useLocalSearchParams<{
    productId: string;
    userId: string;
  }>();
  const colors = useThemeColor();

  const [createMessage, { loading: createMessageLoading }] = useMutation<
    CreateMessageMutation,
    CreateMessageMutationVariables
  >(CREATE_MESSAGE);
  const [markConversationAsRead] = useMutation<
    MarkConversationAsReadMutation,
    MarkConversationAsReadMutationVariables
  >(MARK_CONVERSATION_AS_READ);

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

      markConversationAsRead({
        variables: {
          input: {
            otherUserId: data.me.id === sellerId ? buyerId : sellerId,
            productId: data.product.id,
            markAsRead: true,
          },
        },
        refetchQueries: [TAB_LAYOUT],
      });
    },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  const conversationByDate = data.getConversation
    .slice()
    .reverse()
    .reduce(
      (acc: { [key in string]: (typeof data.getConversation)[0][] }, curr) => {
        const key = dayjs(curr.createdAt).format("DD MMM YYYY");
        return { ...(acc ?? {}), [key]: [...(acc[key] ?? []), curr] };
      },
      {},
    );

  const onSendMessage = (message: string) => {
    if (createMessageLoading || !text) {
      return;
    }
    createMessage({
      variables: {
        input: {
          receiverId: otherUserId,
          productId,
          message,
        },
      },
      onCompleted: () => {
        refetch();
        setText("");
      },
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
          <ActionButtons
            data={data}
            onShowReview={() => setShowReviewSheet(true)}
          />
          <TextInput
            value={text}
            onChange={setText}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "Enter") {
                onSendMessage(text);
              }
            }}
          />
        </View>
      }
    >
      {Object.entries(conversationByDate).map((entry) => {
        const date = entry[0];
        const messages = entry[1];

        return (
          <View key={date}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginVertical: 16,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dividers.neutral,
                }}
              />
              <Body size="small" color="secondary">
                {date}
              </Body>
              <View
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dividers.neutral,
                }}
              />
            </View>
            <View style={{ gap: 8 }}>
              {messages.map((message, i) => {
                const senderIsMe = message.sender.id === data.me.id;
                return (
                  <ChatBlock
                    key={i}
                    message={message.message}
                    type={message.messageType}
                    sender={message.sender}
                    createdAt={message.createdAt}
                    senderIsMe={senderIsMe}
                    onAbortPurchase={() => setShowAbortSheet(true)}
                    onReport={() => setShowReportSheet(true)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
      {data.latestPurchase && (
        <AbortPurchaseBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showAbortSheet}
          onDismiss={() => setShowAbortSheet(false)}
          onAbortPurchaseCompleted={() => refetch()}
        />
      )}
      {data.latestPurchase && (
        <CreateReviewBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showReviewSheet}
          onDismiss={() => setShowReviewSheet(false)}
          onCreateReviewCompleted={() => {
            refetch();
          }}
        />
      )}
      {data.latestPurchase && (
        <ReportPurchaseBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showReportSheet}
          onDismiss={() => setShowReportSheet(false)}
          onCreateReportComplete={() => refetch()}
        />
      )}
    </ScreenLayout>
  );
}

type ChatBlockProps = {
  message: string;
  sender?: ConversationProductQuery["getConversation"][0]["sender"];
  type: MessageTypeEnum;
  createdAt: Date;
  senderIsMe: boolean;
  onAbortPurchase: () => void;
  onReport: () => void;
};

const ChatBlock = ({
  message,
  sender,
  type,
  createdAt,
  senderIsMe,
  onAbortPurchase,
  onReport,
}: ChatBlockProps) => {
  const colors = useThemeColor();

  const isSystemMessage = type === MessageTypeEnum.System;

  return (
    <View style={{ alignItems: senderIsMe ? "flex-end" : "flex-start" }}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        {!senderIsMe && (
          <Avatar
            placeholder={isSystemMessage ? "SYSTEM" : sender?.type}
            imageUrl={sender?.profilePicture?.url}
          />
        )}
        <View
          style={[
            {
              borderTopRightRadius: borderRadius.medium,
              borderTopLeftRadius: borderRadius.medium,

              paddingHorizontal: 16,
              paddingVertical: 8,
              flex: 1,
            },
            senderIsMe
              ? {
                  borderBottomRightRadius: borderRadius.xSmall,
                  borderBottomLeftRadius: borderRadius.medium,
                  backgroundColor: colors.background.secondary,
                  marginLeft: 48,
                }
              : {
                  backgroundColor: colors.buttons.filled.enabled,
                  borderBottomRightRadius: borderRadius.medium,
                  borderBottomLeftRadius: borderRadius.xSmall,
                  marginRight: 48,
                },
            isSystemMessage && {
              backgroundColor: colors.buttons.tonal.enabled,
            },
          ]}
        >
          {isSystemMessage ? (
            <SystemMessage
              text={message}
              onAbortPurchase={onAbortPurchase}
              onReport={onReport}
            />
          ) : (
            <Body
              size="large"
              color={
                senderIsMe || isSystemMessage ? "primaryDark" : "primaryLight"
              }
            >
              {message}
            </Body>
          )}
        </View>
      </View>
      <Body
        size="small"
        style={{ marginLeft: 48, marginTop: 6 }}
        color="secondary"
      >
        {dayjs(createdAt).format("HH:mm")}
      </Body>
    </View>
  );
};

type ActionButtonProps = {
  data: ConversationProductQuery;
  onShowReview: () => void;
};
const ActionButtons = ({ data, onShowReview }: ActionButtonProps) => {
  const purchase = data.latestPurchase;
  const sellerIsMe = data.me.id === data.product.seller.id;

  const [acceptPurchase, { loading: acceptPurchaseLoading }] = useMutation<
    ConversationAcceptPurchaseMutation,
    ConversationAcceptPurchaseMutationVariables
  >(CONVERSATION_ACCEPT_PURCHASE, { refetchQueries: [CONVERSATION_PRODUCT] });
  const [markAsDelivered, { loading: markAsDeliveredLoading }] = useMutation<
    ConversationMarkAsDeliveredMutation,
    ConversationMarkAsDeliveredMutationVariables
  >(CONVERSATION_MARK_AS_DELIVERED, { refetchQueries: [CONVERSATION_PRODUCT] });

  let firstButton: ReactNode = null;
  if (!purchase) {
    firstButton = !sellerIsMe ? (
      <Button
        label="Köp"
        onPress={() => {
          router.navigate({
            pathname: "/buy/[productId]",
            params: { productId: data.product.id },
          });
        }}
      />
    ) : null;
  }
  if (purchase) {
    firstButton = (
      <Button
        label="Visa kvitto"
        type="tonal"
        onPress={() => {
          router.navigate({
            pathname: "/account/purchases/[purchaseId]",
            params: { purchaseId: purchase.id },
          });
        }}
      />
    );
  }

  const renderSecondButton = () => {
    //No second button if there is no purchase
    if (!purchase) {
      return null;
    }
    const hasReviewed = purchase.reviews.some(
      (r) => r.reviewerId === data.me.id,
    );

    //If user has reviewed, there is no more action they can take, return null
    if (hasReviewed) {
      return null;
    }

    //Product is approved, buyer and seller is prompted to leave a review
    if (purchase.approvedAt) {
      return (
        <Button
          label="Lämna ett omdöme"
          onPress={() => {
            onShowReview();
          }}
        />
      );
    }
    //Seller actions
    if (sellerIsMe) {
      //Shipment is booked, seller can display their QR-code
      if (purchase.shipmentBookedAt && sellerIsMe && purchase.qrCodeUrl) {
        return (
          <Button
            label="Visa QR-kod"
            onPress={() => {
              //TODO: show qr-code
            }}
          />
        );
      }
      //Payment is accepted and tranportation method is NOT shipping, seller can mark as delivered
      if (
        purchase.paymentAcceptedAt &&
        !purchase.isShipping &&
        purchase.sellerRespondedAt &&
        !purchase.deliveredAt
      ) {
        return (
          <Button
            label="Markera som överlämnad"
            onPress={() => {
              if (!purchase || markAsDeliveredLoading) {
                return;
              }
              markAsDelivered({
                variables: {
                  input: { purchaseId: purchase.id },
                },
              });
            }}
          />
        );
      }
    } else {
      //buyer actions
      //Product is delivered, buyer can now approve of it
      if (purchase.deliveredAt) {
        return (
          <Button
            label="Godkänn vara"
            onPress={() => {
              if (!purchase || acceptPurchaseLoading) {
                return;
              }
              acceptPurchase({
                variables: {
                  input: { purchaseId: purchase.id },
                },
              });
            }}
          />
        );
      }
    }

    return null;
  };
  const secondButton = renderSecondButton();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <View style={{ flex: 1 }}>{firstButton}</View>
      {secondButton && <View style={{ flex: 2 }}>{secondButton}</View>}
    </View>
  );
};
