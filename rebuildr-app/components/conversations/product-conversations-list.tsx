import { ConversationsQuery } from "@/gql/graphql";
import { MessageRow } from "@components/messages/message-row";

type Props = {
  data?: ConversationsQuery;
  showAsActive?: boolean;
  onConversationSelect?: (conversation: {
    productId: string;
    userId?: string;
    key: number;
  }) => void;
};

export const ProductConversationsList = ({
  data,
  showAsActive,
  onConversationSelect,
}: Props) => {
  if (!data) {
    return null;
  }
  const product = data.getConversations[0].product;
  return (
    <>
      {data.getConversations.map((conversation, i) => {
        const otherUser =
          data.me.id === conversation.sender.id
            ? conversation.receiver
            : conversation.sender;
        return (
          <MessageRow
            key={i}
            otherUser={{
              id: otherUser.id,
              userType: otherUser.type,
              username: otherUser.username,
              url: otherUser.profilePicture?.url,
            }}
            message={{
              message: conversation.message,
              sender: { id: conversation.sender.id },
              createdAt: conversation.createdAt,
              readAt: conversation.readAt,
              productId: product.id,
            }}
            myId={data.me.id}
            active={showAsActive}
            onMessagePress={onConversationSelect}
          />
        );
      })}
    </>
  );
};
