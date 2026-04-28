import { ProductConversationsQuery } from "@/gql/graphql";
import { ConversationRow } from "@components/messages/conversation-row";

type Props = {
  data?: ProductConversationsQuery;
  onConversationSelect?: (conversation: {
    conversationId: string;
    key: number;
  }) => void;
};

export const ProductConversationsList = ({
  data,
  onConversationSelect,
}: Props) => {
  if (!data) {
    return null;
  }
  return (
    <>
      {data.getConversations.map((conversation, i) => {
        if (!conversation.lastMessage) return null;
        const otherUser =
          data.me.id === conversation.buyer.id
            ? conversation.product.seller
            : conversation.buyer;
        return (
          <ConversationRow
            key={i}
            otherUser={{
              id: otherUser.id,
              userType: otherUser.type,
              username: otherUser.username,
              url: otherUser.profilePicture?.url,
            }}
            conversation={conversation}
            myId={data.me.id}
            onConversationsPress={onConversationSelect}
          />
        );
      })}
    </>
  );
};
