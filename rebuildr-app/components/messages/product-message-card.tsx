import { ComponentProps } from "react";
import { AdList } from "@components/ad/ad-list";
import dayjs from "dayjs";
import { GetConversationsQuery, MessageTypeEnum } from "@/gql/graphql";
import { ProductCard } from "@components/cards/product-card";

type Props = {
  adList: ComponentProps<typeof AdList>;
  myId: string;
  messages: {
    sender: GetConversationsQuery["getConversations"][0]["sender"];
    receiver: GetConversationsQuery["getConversations"][0]["receiver"];
    messageType: MessageTypeEnum;
    message: string;
    createdAt: Date;
    readAt?: Date;
  }[];
  onPress: () => void;
};

export const ProductMessageCard = ({
  adList,
  myId,
  messages,
  onPress,
}: Props) => {
  const nrOfUnread = messages.reduce(
    (acc, curr) => acc + (curr.sender.id !== myId && !curr.readAt ? 1 : 0),
    0,
  );

  const getOtherUser = (message: (typeof messages)[0]) =>
    message.receiver.id === myId ? message.sender : message.receiver;

  const singleSenderMessage = (message: (typeof messages)[0]) => {
    if (message.messageType === MessageTypeEnum.System) {
      return `${message.sender.username}`;
    }
    return `${message.sender.username}: ${message.message}`;
  };

  return (
    <ProductCard
      onPress={onPress}
      active={nrOfUnread > 0}
      adListProps={adList}
      avatars={[
        {
          userType: getOtherUser(messages[0]).type,
          imageUrl: getOtherUser(messages[0]).profilePicture?.url,
        },
        ...(messages[1]
          ? [
              {
                userType: getOtherUser(messages[1]).type,
                imageUrl: getOtherUser(messages[1]).profilePicture?.url,
              },
            ]
          : []),
      ]}
      primaryText={
        messages.length === 1
          ? singleSenderMessage(messages[0])
          : `${messages[0].sender.username} och ${messages.length - 1} ${messages.length > 2 ? "andra" : "annan"}`
      }
      secondaryText={dayjs(messages[0].createdAt).fromNow()}
      badgeProps={
        nrOfUnread
          ? {
              text: `${nrOfUnread} ${nrOfUnread > 1 ? "olästa" : "oläst"}`,
            }
          : undefined
      }
    />
  );
};
