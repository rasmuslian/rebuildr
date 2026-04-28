import { ConversationsPerProductType } from "@/utils/conversations/parse-conversations";
import { ProductMessageCard } from "@components/messages/product-message-card";
import { useScreenType } from "@hooks/useScreenType";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  conversationsGroups: ConversationsPerProductType;
  myId: string;
  selectedProductId: string;
  onSelect?: (input: { productId: string; key: number }) => void;
};

export const ConversationGroupCards = ({
  conversationsGroups,
  myId,
  selectedProductId,
  onSelect,
}: Props) => {
  const { isDesktop } = useScreenType();
  const handleConversationPress = (
    conversationGroup: ConversationsPerProductType[number],
    key: number,
  ) => {
    if (onSelect) {
      onSelect({ productId: conversationGroup.productId, key });
      return;
    }
    const productId = conversationGroup.productId;
    if (conversationGroup.conversations.length > 1) {
      router.navigate({
        pathname: "/conversations/[productId]",
        params: { productId },
      });
    } else {
      router.navigate({
        pathname: "/conversation/[conversationId]",
        params: {
          conversationId: conversationGroup.conversations[0].id,
        },
      });
    }
  };
  return (
    <>
      {conversationsGroups.map((conversationGroup, i) => {
        const product = conversationGroup.conversations[0].product;
        const sortedByLatest = conversationGroup.conversations.sort((a, b) =>
          dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1,
        );

        return (
          <ProductMessageCard
            key={i}
            myId={myId}
            selected={
              isDesktop
                ? selectedProductId === conversationGroup.productId
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
            conversations={sortedByLatest}
            onPress={() => handleConversationPress(conversationGroup, i)}
          />
        );
      })}
    </>
  );
};
