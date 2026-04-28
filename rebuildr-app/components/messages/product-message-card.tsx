import { ComponentProps } from "react";
import { AdList } from "@components/ad/ad-list";
import dayjs from "dayjs";
import { MessageTypeEnum } from "@/gql/graphql";
import { ProductCard } from "@components/cards/product-card";
import { ConversationsPerProductType } from "@/utils/conversations/parse-conversations";

type Conversation =
  ConversationsPerProductType[number]["conversations"][number];

type Props = {
  adList: ComponentProps<typeof AdList>;
  myId: string;
  conversations: ConversationsPerProductType[number]["conversations"];
  onPress: () => void;
  selected?: boolean;
};

export const ProductMessageCard = ({
  adList,
  myId,
  conversations,
  onPress,
  selected,
}: Props) => {
  const isUnread = (c: Conversation) => {
    if (!c.lastMessage?.createdAt || c.lastMessage.sender?.id === myId)
      return false;
    const lastAt = new Date(c.lastMessage.createdAt);
    const readAt = c.buyerId === myId ? c.buyerReadAt : c.sellerReadAt;
    return !readAt || lastAt > new Date(readAt);
  };

  const nrOfUnread = conversations.filter(isUnread).length;

  const getOtherUser = (c: Conversation) =>
    c.buyerId !== myId ? c.buyer : c.product.seller;

  const lastMessagePreview = (c: Conversation) => {
    if (!c.lastMessage) return "";
    if (c.lastMessage.messageType === MessageTypeEnum.System)
      return "Systemmeddelande";
    return `${c.lastMessage.sender?.username ?? ""}: ${c.lastMessage.message}`;
  };

  const latestConvo = conversations
    .slice()
    .sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt ?? b.createdAt).getTime() -
        new Date(a.lastMessage?.createdAt ?? a.createdAt).getTime(),
    )[0];

  return (
    <ProductCard
      onPress={onPress}
      active={selected !== undefined ? selected : nrOfUnread > 0}
      adListProps={adList}
      avatars={conversations.slice(0, 2).map((c) => ({
        placeholder: getOtherUser(c)?.type,
        imageUrl: getOtherUser(c)?.profilePicture?.url,
      }))}
      primaryText={
        conversations.length === 1
          ? lastMessagePreview(conversations[0])
          : `${getOtherUser(conversations[0])?.username} och ${conversations.length - 1} ${conversations.length > 2 ? "andra" : "annan"}`
      }
      secondaryText={dayjs(
        latestConvo?.lastMessage?.createdAt ?? latestConvo?.createdAt,
      ).fromNow()}
      badgeProps={
        nrOfUnread
          ? { text: `${nrOfUnread} ${nrOfUnread > 1 ? "olästa" : "oläst"}` }
          : undefined
      }
    />
  );
};
