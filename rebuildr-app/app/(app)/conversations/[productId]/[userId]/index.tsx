import { Avatar } from "@components/avatar/avatar";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Label, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import dayjs from "dayjs";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { ReactNode, useState } from "react";
import { Badge } from "@components/badges/badge";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  ConversationAcceptPurchaseMutation,
  ConversationAcceptPurchaseMutationVariables,
  ConversationMarkAsDeliveredMutation,
  ConversationMarkAsDeliveredMutationVariables,
  ConversationProductQuery,
  ConversationProductQueryVariables,
  CreateMessageMutation,
  CreateMessageMutationVariables,
  LatestPurchaseQuery,
  LatestPurchaseQueryVariables,
  MarkConversationAsReadMutation,
  MarkConversationAsReadMutationVariables,
  MessageTypeEnum,
} from "@/gql/graphql";
import { SystemMessage } from "@components/messages/system-message";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const CONVERSATION_PRODUCT = gql`
  query ConversationProduct(
    $input: GetConversationInput!
    $getProductInput: GetProductInput!
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
      seller {
        id
        username
      }
      primaryImage {
        id
        url
      }
    }
    me {
      id
      username
    }
  }
`;

const LATEST_PURCHASE = gql`
  query LatestPurchase($input: LatestPurchaseInput!) {
    latestPurchase(input: $input) {
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
      reviews {
        id
        reviewerId
        revieweeId
      }
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
  const { productId, userId: otherEndUserId } = useLocalSearchParams<{
    productId: string;
    userId: string;
  }>();

  const [createMessage, { loading: createMessageLoading }] = useMutation<
    CreateMessageMutation,
    CreateMessageMutationVariables
  >(CREATE_MESSAGE);
  const [markConversationAsRead] = useMutation<
    MarkConversationAsReadMutation,
    MarkConversationAsReadMutationVariables
  >(MARK_CONVERSATION_AS_READ);
  const [getPurchase, { data: purchaseData }] = useLazyQuery<
    LatestPurchaseQuery,
    LatestPurchaseQueryVariables
  >(LATEST_PURCHASE);

  const { data, refetch } = useQuery<
    ConversationProductQuery,
    ConversationProductQueryVariables
  >(CONVERSATION_PRODUCT, {
    variables: {
      input: {
        productId,
        otherEndUserId,
      },
      getProductInput: { id: productId },
    },
    onCompleted(data) {
      const sellerId = data.product.seller.id;
      const buyerId = sellerId === otherEndUserId ? data.me.id : otherEndUserId;
      getPurchase({
        variables: {
          input: {
            productId,
            buyerId,
            sellerId,
          },
        },
        fetchPolicy: "network-only",
      });
      markConversationAsRead({
        variables: {
          input: {
            otherEndUserId: data.me.id === sellerId ? buyerId : sellerId,
            productId: data.product.id,
            markAsRead: true,
          },
        },
      });
    },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  const onSendMessage = (message: string) => {
    if (createMessageLoading || !text) {
      return;
    }
    createMessage({
      variables: {
        input: {
          receiverId: otherEndUserId,
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

  const getBadgeText = () => {
    const purchase = purchaseData?.latestPurchase;
    if (!data || !purchase) {
      return null;
    }

    if (purchase.deliveredAt) {
      return "Köp slutfört";
    }

    if (purchase.isShipping) {
      if (purchase.shipmentBookedAt) {
        return "Pågående leverans";
      }
      if (purchase.paymentAcceptedAt) {
        return "Inväntar inlämning";
      }
    } else {
      const sellerHasResponded = data.getConversation.some(
        (message) =>
          message.sender.id === data.product.seller.id &&
          message.messageType === MessageTypeEnum.User,
      );
      if (purchase.paymentAcceptedAt && sellerHasResponded) {
        return "Inväntar överlämning";
      }
      if (purchase.paymentAcceptedAt) {
        return "Inväntar svar";
      }
    }
    return null;
  };
  const statusBadgeText = getBadgeText();

  const otherUser = data?.getConversation[0]
    ? data.getConversation[0].sender.id === data.me.id
      ? data.getConversation[0].receiver
      : data.getConversation[0].sender
    : data?.product.seller;

  return (
    <ScreenLayout
      headerComponent={
        <View style={{ gap: 16 }}>
          <Header title={otherUser?.username} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View
              style={{
                alignItems: "flex-start",
                flex: 1,
              }}
            >
              <Title size="small" numberOfLines={1}>
                {data?.product.title}
              </Title>
              <Label size="large" style={{ marginTop: 2 }}>
                {data.product.price} kr
              </Label>
              {statusBadgeText && (
                <View style={{ marginTop: 8, flex: 1 }}>
                  <Badge text={statusBadgeText} />
                </View>
              )}
            </View>
            <Image
              source={{ uri: data?.product.primaryImage?.url }}
              style={{
                width: 64,
                height: 64,
                borderRadius: borderRadius.small,
              }}
            />
          </View>
          <Divider />
        </View>
      }
      footerComponent={
        <View style={{ gap: 16 }}>
          <Divider />
          <ActionButtons purchaseData={purchaseData} data={data} />
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
      <View style={{ gap: 8, flexDirection: "column-reverse" }}>
        {data?.getConversation.map((message, i) => {
          const senderIsMe = message.sender.id === data.me.id;
          return (
            <ChatBlock
              key={i}
              message={message.message}
              type={message.messageType}
              sender={message.sender}
              createdAt={message.createdAt}
              senderIsMe={senderIsMe}
            />
          );
        })}
      </View>
    </ScreenLayout>
  );
}

type ChatBlockProps = {
  message: string;
  sender?: ConversationProductQuery["getConversation"][0]["sender"];
  type: MessageTypeEnum;
  createdAt: Date;
  senderIsMe: boolean;
};

const ChatBlock = ({
  message,
  sender,
  type,
  createdAt,
  senderIsMe,
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
          <Avatar userType={isSystemMessage ? "SYSTEM" : sender?.type} />
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
            <SystemMessage text={message} />
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
  purchaseData?: LatestPurchaseQuery;
  data: ConversationProductQuery;
};
const ActionButtons = ({ purchaseData, data }: ActionButtonProps) => {
  const purchase = purchaseData?.latestPurchase;
  const sellerIsMe = data.me.id === data.product.seller.id;

  const [acceptPurchase, { loading: acceptPurchaseLoading }] = useMutation<
    ConversationAcceptPurchaseMutation,
    ConversationAcceptPurchaseMutationVariables
  >(CONVERSATION_ACCEPT_PURCHASE);
  const [markAsDelivered, { loading: markAsDeliveredLoading }] = useMutation<
    ConversationMarkAsDeliveredMutation,
    ConversationMarkAsDeliveredMutationVariables
  >(CONVERSATION_MARK_AS_DELIVERED);

  let firstButton: ReactNode = null;
  if (!purchase) {
    firstButton = !sellerIsMe ? (
      <Button label="Köp" onPress={() => {}} />
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
            //TODO: navigate to review screen
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

      const sellerHasResponded = data.getConversation.some(
        (message) =>
          message.sender.id === data.product.seller.id &&
          message.messageType === MessageTypeEnum.User,
      );
      //Payment is accepted and tranportation method is NOT shipping, seller can mark as delivered
      if (
        purchase.paymentAcceptedAt &&
        !purchase.isShipping &&
        sellerHasResponded
      ) {
        return (
          <Button
            label="Markera som överlämnad"
            onPress={() => {
              if (!purchaseData.latestPurchase || markAsDeliveredLoading) {
                return;
              }
              markAsDelivered({
                variables: {
                  input: { purchaseId: purchaseData.latestPurchase.id },
                },
              });
            }}
          />
        );
      }
    } else {
      //buyer actions
      //Product is delivered, buyer can now approve of it
      console.log("hallå!");
      if (purchase.deliveredAt) {
        return (
          <Button
            label="Godkänn vara"
            onPress={() => {
              if (!purchaseData.latestPurchase || acceptPurchaseLoading) {
                return;
              }
              acceptPurchase({
                variables: {
                  input: { purchaseId: purchaseData.latestPurchase.id },
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
