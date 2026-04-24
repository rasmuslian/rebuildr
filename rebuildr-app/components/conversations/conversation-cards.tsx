import { ConversationsPerProductType } from "@/utils/conversations/parse-conversations";
import { ProductMessageCard } from "@components/messages/product-message-card";
import { useScreenType } from "@hooks/useScreenType";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  conversationsGroup: ConversationsPerProductType;
  myId: string;
  selectedConversation?: { productId: string; userId?: string; key: number };
  onSelectConversation?: (args: {
    productId: string;
    userId?: string;
    key: number;
  }) => void;
};

export const ConversationCards = ({
  conversationsGroup,
  myId,
  selectedConversation,
  onSelectConversation,
}: Props) => {
  const { isDesktop } = useScreenType();
  const handleConversationPress = ({
    productId,
    userId,
    key,
    myRole,
  }: {
    productId: string;
    userId?: string;
    key: number;
    myRole: "seller" | "buyer";
  }) => {
    if (onSelectConversation) {
      onSelectConversation({ productId, userId, key });
    } else if (userId) {
      router.navigate({
        pathname: "/conversations/[productId]/[userId]",
        params: {
          productId,
          userId,
        },
      });
    } else {
      router.navigate({
        pathname: "/conversations/[productId]",
        params: { productId, role: myRole },
      });
    }
  };
  return (
    <>
      {conversationsGroup.map((conversationGroup, i) => {
        const product = conversationGroup.conversations[0].product;
        const sortedByLatest = conversationGroup.conversations.sort((a, b) =>
          dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1,
        );
        const isMoreThanOneUser = sortedByLatest.length > 1;
        const firstConversation = sortedByLatest[0];
        const userId = isMoreThanOneUser
          ? undefined
          : firstConversation.sender.id === myId
            ? firstConversation.receiver.id
            : firstConversation.sender.id;
        const myRole = product.seller.id === myId ? "seller" : "buyer";

        return (
          <ProductMessageCard
            key={i}
            myId={myId}
            selected={
              isDesktop
                ? selectedConversation?.productId === product.id
                : undefined
            }
            adList={{
              title: product.title,
              status: product.status,
              quantity: product.primaryQuantity ?? 0,
              quantityUnit: product.primaryUnit ?? undefined,
              condition: product.condition,
              price: product.price,
              soldByQuantity: product.soldByQuantity,
              imageUrl: product.primaryImage?.url,
            }}
            messages={sortedByLatest.map((conversation) => ({
              sender: conversation.sender,
              receiver: conversation.receiver,
              message: conversation.message,
              messageType: conversation.messageType,
              createdAt: conversation.createdAt,
              readAt: conversation.readAt,
            }))}
            onPress={() =>
              handleConversationPress({
                productId: conversationGroup.productId,
                userId,
                key: i,
                myRole,
              })
            }
          />
        );
      })}
    </>
  );
};
