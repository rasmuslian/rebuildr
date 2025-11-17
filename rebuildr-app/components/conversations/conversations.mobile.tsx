import { GetConversationsQuery } from "@/gql/graphql";
import { parseConversations } from "@/utils/conversations/parse-conversations";
import { ConversationsList } from "@components/conversations/conversations-list";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  data: GetConversationsQuery;
  myId: string;
};

export const ConversationsMobile = ({ data, myId }: Props) => {
  const [tab, setTab] = useState<"sell" | "buy">("sell");

  const { totalUnread, nrUnreadBuy, nrUnreadSell, unread, read } =
    parseConversations(data, tab);
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
