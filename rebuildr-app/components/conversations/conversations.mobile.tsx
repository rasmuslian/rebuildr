import { GetConversationsQuery } from "@/gql/graphql";
import { ConversationsList } from "@components/conversations/conversations-list";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";

type Props = {
  totalUnread: number;
  nrUnreadSell: number;
  nrUnreadBuy: number;
  tab: "buy" | "sell";
  setTab: (tab: "buy" | "sell") => void;
  unread: {
    productId: string;
    conversations: GetConversationsQuery["getConversations"];
  }[];
  read: {
    productId: string;
    conversations: GetConversationsQuery["getConversations"];
  }[];
  myId: string;
};

export const ConversationsMobile = ({
  totalUnread,
  nrUnreadSell,
  nrUnreadBuy,
  tab,
  setTab,
  unread,
  read,
  myId,
}: Props) => {
  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout
        headerComponent={<Header title="Inkorg" showBackButton={false} />}
        style={{ gap: 24 }}
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
        />
      </ScreenLayout>
    </View>
  );
};
