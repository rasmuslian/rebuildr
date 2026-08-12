import { Divider, dividerStyles } from "@components/dividers/divider";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { ConversationEmptyState } from "@components/conversations/conversation-empty-state";
import { ConversationsList } from "@components/conversations/conversations-list";
import { useEffect, useRef, useState } from "react";
import { Conversation } from "@components/conversations/conversation";
import { gql, useQuery } from "@apollo/client";
import {
  ConversationQuery,
  ConversationQueryVariables,
  CreateMessageMutation,
  GetConversationsQuery,
  GetConversationsType,
  InitialChatQuery,
  InitialChatQueryVariables,
  Product,
  ProductConversationsQuery,
  ProductConversationsQueryVariables,
  Purchase,
  User,
} from "@/gql/graphql";
import { Header } from "@components/navigation/headers/header";
import { ChatActionButtons } from "@components/conversations/chat-action-buttons";
import { useMarkConversationAsRead } from "@hooks/conversation/use-mark-conversation-as-read";
import { TAB_LAYOUT } from "@/queries";
import { ProductConversationsList } from "@components/conversations/product-conversations-list";
import { AdList } from "@components/ad/ad-list";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import dayjs from "dayjs";
import { MessageInput } from "./message-input";
import { useLocalSearchParams } from "expo-router";
import { parseConversations } from "@/utils/conversations/parse-conversations";
import { Popup } from "@components/popup/popup";
import { ShippingCodeContent } from "@components/shipping-code/shipping-code-content";
import { CONVERSATION } from "@/app/(app)/conversation/[conversationId]";
import { PRODUCT_CONVERSATIONS } from "@/app/(app)/conversations/[productId]";
import { GET_CONVERSATIONS } from "@/app/(app)/(tabs)/conversations";
import { ChatHeader } from "./chat-header";

const INITIAL_CHAT = gql`
  query initialChat($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      price
      soldByQuantity
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
    me {
      id
      type
    }
  }
`;

type Props = {
  data: GetConversationsQuery;
  myId: string;
  refetch: () => void;
};

export const ConversationsDesktop = ({ data, myId, refetch }: Props) => {
  const colors = useThemeColor();
  const { height: windowHeight } = useWindowDimensions();
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [selectedConversationGroup, setSelectedConversationGroup] = useState<
    | {
        productId: string;
        key: number;
      }
    | undefined
  >(undefined);
  const [selectedConversation, setSelectedConversation] = useState<
    { conversationId: string } | undefined
  >(undefined);
  const {
    productId, //If this exists we have navigated here through a product
  } = useLocalSearchParams<{
    productId?: string;
  }>();
  const isNavigationSelect = useRef(false);
  const { all: buyConversations } = parseConversations(data, "buy");
  const { all: sellConversations } = parseConversations(data, "sell");
  const hasOnlyBuyConversations =
    sellConversations.length === 0 && buyConversations.length > 0;
  const [tab, setTab] = useState<"sell" | "buy">(
    hasOnlyBuyConversations ? "buy" : "sell",
  );

  const { totalUnread, nrUnreadBuy, nrUnreadSell, unread, read, all } =
    parseConversations(data, tab);

  const renderRightColumn = () => {
    if (selectedConversation) {
      const conversation = data.getConversations.find(
        (cg) => cg.id === selectedConversation.conversationId,
      );
      if (!conversation) return null;
      return (
        <Chat
          conversationId={selectedConversation.conversationId}
          productId={conversation.product.id}
          showReviewSheet={showReviewSheet}
          setShowReviewSheet={setShowReviewSheet}
        />
      );
    }
    if (selectedConversationGroup) {
      const groupExists = data.getConversations.find(
        (c) => c.product.id === selectedConversationGroup.productId,
      );
      if (!groupExists) {
        return (
          <InitialChat
            productId={selectedConversationGroup.productId}
            onChatInitiated={(data) => {
              setSelectedConversation({
                conversationId: data.createMessage.conversationId,
              });
              refetch();
            }}
          />
        );
      }
      return (
        <SelectedProductConversations
          productId={selectedConversationGroup.productId}
          setSelectedConversation={setSelectedConversation}
        />
      );
    }
    return <ConversationEmptyState />;
  };

  const onSelectConversationGroup = (productId: string) => {
    const selectedGroup = all.find((group) => group.productId === productId);
    //If there is a selected conversation, unselect it
    if (selectedConversation) {
      setSelectedConversation(undefined);
    }
    setSelectedConversationGroup({
      productId,
      key: 0,
    });
    if (!selectedGroup) {
      return;
    }
    //If there is only one conversation in the group, select the conversation immidiately
    if (selectedGroup.conversations.length === 1) {
      setSelectedConversation({
        conversationId: selectedGroup.conversations[0].id,
      });
    }
  };

  useEffect(() => {
    if (isNavigationSelect.current === false && !productId) {
      let conversationGroup;
      if (unread.length > 0) {
        conversationGroup = unread[0];
      } else if (read.length > 0) {
        conversationGroup = read[0];
      } else {
        setSelectedConversationGroup(undefined);
        return;
      }
      const sortedByLatest = conversationGroup.conversations.sort(
        (a: any, b: any) => (dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1),
      );

      onSelectConversationGroup(sortedByLatest[0].product.id);
    }
    isNavigationSelect.current = false;
  }, [tab]);

  useEffect(() => {
    if (!productId) {
      return;
    }
    //We came here through a product and therefore productId is set in the navigation params

    onSelectConversationGroup(productId);

    isNavigationSelect.current = true;
    if (sellConversations.find((convo) => convo.productId === productId)) {
      setTab("sell");
    } else {
      setTab("buy");
    }
  }, [productId]);

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
            style={{ height: (windowHeight * 4) / 5 }}
            showsVerticalScrollIndicator={false}
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
              selectedConversationGroup={selectedConversationGroup}
              onSelectConversationGroup={({ productId, key }) => {
                onSelectConversationGroup(productId);
              }}
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
  conversationId: string;
  productId: string;
  showReviewSheet: boolean;
  setShowReviewSheet: (show: boolean) => void;
};

const Chat = ({
  conversationId,
  showReviewSheet,
  setShowReviewSheet,
}: ChatProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { height: windowHeight } = useWindowDimensions();

  const { onMarkConversationAsRead } = useMarkConversationAsRead();

  const { data, refetch, loading } = useQuery<
    ConversationQuery,
    ConversationQueryVariables
  >(CONVERSATION, {
    variables: {
      input: {
        id: conversationId,
      },
    },
    onCompleted() {
      onMarkConversationAsRead({
        conversationId,
        refetchQueries: [TAB_LAYOUT, GET_CONVERSATIONS],
      });
    },
  });

  const sellerIsMe = data?.me.id === data?.getConversation.product.seller.id;

  if (!data || loading) {
    return <LoadingSpinner />;
  }

  const product = data.getConversation.product;
  const otherUser = sellerIsMe ? data.getConversation.buyer : product.seller;

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        paddingLeft: 48,
        paddingBottom: 16,
      }}
    >
      <ChatHeader
        otherUser={otherUser as User}
        sellerIsMe={sellerIsMe}
        product={data.getConversation.product as Product}
        purchase={data.getConversation.purchase as Purchase | undefined | null}
      />
      <ScrollView
        style={{ height: windowHeight / 2 }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, gap: 8 }}
        showsVerticalScrollIndicator={false}
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
            product={data.getConversation.product as Product}
            purchase={
              data.getConversation.purchase as Purchase | undefined | null
            }
            me={data.me as User}
            onShowReview={() => setShowReviewSheet(true)}
            onShowQRCode={() => setShowQRCode(true)}
          />
          <View style={{ flex: 1 }}>
            <MessageInput
              conversationId={conversationId}
              productId={product.id}
              onMessageSent={() => refetch()}
            />
          </View>
        </View>
      </View>
      <Popup open={showQRCode} onClose={() => setShowQRCode(false)}>
        {data.getConversation.purchase && (
          <ShippingCodeContent
            purchase={data.getConversation.purchase}
            showUpload
          />
        )}
      </Popup>
    </View>
  );
};

type InitialChatProps = {
  productId: string;
  onChatInitiated: (data: CreateMessageMutation) => void;
};

const InitialChat = ({ productId, onChatInitiated }: InitialChatProps) => {
  const { height: windowHeight } = useWindowDimensions();

  const { data } = useQuery<InitialChatQuery, InitialChatQueryVariables>(
    INITIAL_CHAT,
    {
      variables: {
        input: {
          id: productId,
        },
      },
    },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  const otherUser = data.product.seller;

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        paddingLeft: 48,
        paddingBottom: 16,
      }}
    >
      <ChatHeader
        otherUser={otherUser as User}
        sellerIsMe={false}
        product={data.product as Product}
      />
      <View
        style={{
          height: windowHeight / 2,
          flexGrow: 1,
          paddingVertical: 24,
        }}
      />
      <View style={{ gap: 16 }}>
        <Divider />
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ChatActionButtons
            product={data.product as Product}
            me={data.me as User}
          />
          <View style={{ flex: 1 }}>
            <MessageInput
              productId={data.product.id}
              onMessageSent={onChatInitiated}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

type ProductConversationsProps = {
  productId: string;
  setSelectedConversation: (conversation: { conversationId: string }) => void;
};

const SelectedProductConversations = ({
  productId,
  setSelectedConversation,
}: ProductConversationsProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const { data, loading } = useQuery<
    ProductConversationsQuery,
    ProductConversationsQueryVariables
  >(PRODUCT_CONVERSATIONS, {
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
          onConversationSelect={setSelectedConversation}
        />
      </ScrollView>
    </View>
  );
};
