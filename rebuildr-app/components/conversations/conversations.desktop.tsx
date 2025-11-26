import { Divider, dividerStyles } from "@components/dividers/divider";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { ConversationEmptyState } from "@components/conversations/conversation-empty-state";
import { ConversationsList } from "@components/conversations/conversations-list";
import { useEffect, useRef, useState } from "react";
import { Conversation } from "@components/conversations/conversation";
import { useQuery } from "@apollo/client";
import {
  ConversationProductQuery,
  ConversationProductQueryVariables,
  ConversationsQuery,
  ConversationsQueryVariables,
  GetConversationsQuery,
  GetConversationsType,
} from "@/gql/graphql";
import { CONVERSATION_PRODUCT } from "../../app/(app)/conversations/[productId]/[userId]";
import { Header } from "@components/navigation/headers/header";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { ChatActionButtons } from "@components/conversations/chat-action-buttons";
import { useMarkConversationAsRead } from "@hooks/conversation/use-mark-conversation-as-read";
import { TAB_LAYOUT } from "../../app/(app)/(tabs)/_layout";
import { CONVERSATIONS } from "../../app/(app)/conversations/[productId]";
import { ProductConversationsList } from "@components/conversations/product-conversations-list";
import { AdList } from "@components/ad/ad-list";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import dayjs from "dayjs";
import { MessageInput } from "./message-input";
import { useLocalSearchParams } from "expo-router";
import { parseConversations } from "@/utils/conversations/parse-conversations";

type Props = {
  data: GetConversationsQuery;
  myId: string;
};

export const ConversationsDesktop = ({ data, myId }: Props) => {
  const colors = useThemeColor();
  const { height: windowHeight } = useWindowDimensions();
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    | {
        productId: string;
        userId?: string;
        key: number;
      }
    | undefined
  >(undefined);
  const { productId, userId: otherUserId } = useLocalSearchParams<{
    productId: string;
    userId: string;
  }>();
  const isNavigationSelect = useRef(false);
  const { all: buyConversations } = parseConversations(data, "buy");
  const { all: sellConversations } = parseConversations(data, "sell");
  const hasOnlyBuyConversations =
    sellConversations.length === 0 && buyConversations.length > 0;
  const [tab, setTab] = useState<"sell" | "buy">(
    hasOnlyBuyConversations ? "buy" : "sell",
  );

  const { totalUnread, nrUnreadBuy, nrUnreadSell, unread, read } =
    parseConversations(data, tab);

  const renderRightColumn = () => {
    if (selectedConversation?.userId) {
      return (
        <Chat
          productId={selectedConversation.productId}
          userId={selectedConversation.userId}
          showReviewSheet={showReviewSheet}
          setShowReviewSheet={setShowReviewSheet}
        />
      );
    }
    if (selectedConversation?.productId) {
      return (
        <SelectedProductConversations
          productId={selectedConversation.productId}
          setSelectedConversation={setSelectedConversation}
        />
      );
    }
    return <ConversationEmptyState />;
  };

  useEffect(() => {
    if (isNavigationSelect.current === false) {
      let conversation;
      if (unread.length > 0) {
        conversation = unread[0];
      } else if (read.length > 0) {
        conversation = read[0];
      } else {
        setSelectedConversation(undefined);
        return;
      }
      const sortedByLatest = conversation.conversations.sort(
        (a: any, b: any) => (dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1),
      );
      const isMoreThanOneUser = sortedByLatest.length > 1;
      const firstConversation = sortedByLatest[0];
      const userId = isMoreThanOneUser
        ? undefined
        : firstConversation.sender.id === myId
          ? firstConversation.receiver.id
          : firstConversation.sender.id;
      setSelectedConversation({
        productId: conversation.productId,
        userId,
        key: 0,
      });
    }
    isNavigationSelect.current = false;
  }, [tab]);

  useEffect(() => {
    if (!productId && !otherUserId) {
      return;
    }
    setSelectedConversation({
      productId: productId!,
      userId: otherUserId,
      key: 0,
    });
    isNavigationSelect.current = true;
    if (sellConversations.find((convo) => convo.productId === productId)) {
      setTab("sell");
    } else {
      setTab("buy");
    }
  }, [productId, otherUserId]);

  return (
    <ScreenLayout
      headerComponent={<TopBar theme="light" />}
      style={{ gap: 24 }}
      desktopFooter
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: -24,
          marginBottom: -32,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={[
              {
                paddingVertical: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingRight: 48,
              },
              dividerStyles(colors).bottomDivider,
            ]}
          >
            <Title size="medium">Inkorg</Title>
          </View>
          <ScrollView
            style={{ height: (windowHeight * 2) / 3 }}
            contentContainerStyle={{
              paddingVertical: 24,
              gap: 16,
              paddingRight: 48,
            }}
          >
            <ConversationsList
              totalUnread={totalUnread}
              nrUnreadSell={nrUnreadSell}
              nrUnreadBuy={nrUnreadBuy}
              tab={tab}
              setTab={setTab}
              unread={unread}
              read={read}
              myId={myId}
              selectedConversation={selectedConversation}
              onSelectConversation={({ productId, userId, key }) =>
                setSelectedConversation({ productId, userId, key })
              }
            />
          </ScrollView>
        </View>
        <View
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            borderLeftWidth: 1,
            borderLeftColor: colors.dividers.neutral,
          }}
        >
          {renderRightColumn()}
        </View>
      </View>
    </ScreenLayout>
  );
};

type ChatProps = {
  productId: string;
  userId: string;
  showReviewSheet: boolean;
  setShowReviewSheet: (show: boolean) => void;
};

const Chat = ({
  productId,
  userId,
  showReviewSheet,
  setShowReviewSheet,
}: ChatProps) => {
  const { height: windowHeight } = useWindowDimensions();

  const { onMarkConversationAsRead } = useMarkConversationAsRead();

  const { data, refetch, loading } = useQuery<
    ConversationProductQuery,
    ConversationProductQueryVariables
  >(CONVERSATION_PRODUCT, {
    variables: {
      input: {
        productId,
        otherUserId: userId!,
      },
      getProductInput: { id: productId },
      latestPurchaseInput: {
        otherUserId: userId!,
        productId,
      },
    },
    onCompleted(data) {
      const sellerId = data.product.seller.id;
      const buyerId = sellerId === userId! ? data.me.id : userId!;
      onMarkConversationAsRead({
        otherUserId: data.me.id === sellerId ? buyerId : sellerId,
        productId: data.product.id,
        refetchQueries: [TAB_LAYOUT],
      });
    },
  });

  if (!data || loading) {
    return <LoadingSpinner />;
  }

  const otherUser = data.getConversation[0]
    ? data.getConversation[0].sender.id === data.me.id
      ? data.getConversation[0].receiver
      : data.getConversation[0].sender
    : data.product.seller;

  const sellerIsMe = data.me.id === data.product.seller.id;

  const statusBadgeProps = getProductBadgeProps(
    data.product.status,
    sellerIsMe ? "seller" : "buyer",
    data.latestPurchase,
  );

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        paddingLeft: 48,
        paddingBottom: 16,
      }}
    >
      <View style={{ gap: 16 }}>
        <Header title={otherUser?.username} showBackButton={false} />
        <ProductHeader
          id={data.product.id}
          title={data.product.title}
          price={data.product.price}
          statusBadgeProps={statusBadgeProps}
          status={data.product.status}
          imageUrl={data.product.primaryImage?.url}
          shouldNavigate
        />
      </View>
      <ScrollView
        style={{ height: windowHeight / 2 }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, gap: 8 }}
      >
        <Conversation
          data={data}
          refetch={refetch}
          showReviewSheet={showReviewSheet}
          setShowReviewSheet={setShowReviewSheet}
        />
      </ScrollView>
      <View style={{ gap: 16 }}>
        <Divider />
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ChatActionButtons
            data={data}
            onShowReview={() => setShowReviewSheet(true)}
          />
          <View style={{ flex: 1 }}>
            <MessageInput
              receiverId={otherUser.id}
              productId={data.product.id}
              onMessageSent={refetch}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

type ProductConversationsProps = {
  productId: string;
  setSelectedConversation: (conversation: {
    productId: string;
    userId?: string;
    key: number;
  }) => void;
};

const SelectedProductConversations = ({
  productId,
  setSelectedConversation,
}: ProductConversationsProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const { data, loading } = useQuery<
    ConversationsQuery,
    ConversationsQueryVariables
  >(CONVERSATIONS, {
    variables: {
      input: { productId, type: GetConversationsType.BuyingAndSelling },
    },
  });

  if (!data || loading) {
    return <LoadingSpinner />;
  }
  const product = data.getConversations[0].product;
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        paddingLeft: 48,
      }}
    >
      <View style={{ gap: 16 }}>
        <Header
          title={`${data.getConversations.length} konversationer`}
          showBackButton={false}
        />
        <AdList
          title={product.title}
          condition={product.condition}
          price={product.price}
          quantity={product.primaryQuantity}
          quantityUnit={product.primaryUnit}
          imageUrl={product.primaryImage?.url}
          status={product.status}
        />
        <Divider />
      </View>
      <ScrollView
        style={{ height: windowHeight / 2, paddingBottom: 16 }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, gap: 16 }}
      >
        <ProductConversationsList
          data={data}
          showAsActive
          onConversationSelect={setSelectedConversation}
        />
      </ScrollView>
    </View>
  );
};
