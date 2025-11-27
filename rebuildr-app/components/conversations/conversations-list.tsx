import { Divider } from "@components/dividers/divider";
import { AccordionSection } from "@components/sections/accordion-section";
import { TabRail } from "@components/tabs/tab-rail";
import { Body, Display, Headline } from "@components/typography/text";
import { View } from "react-native";
import { ConversationCards } from "./conversation-cards";
import { ConversationsPerProductType } from "@/utils/conversations/parse-conversations";

type Props = {
  totalUnread: number;
  nrUnreadSell: number;
  nrUnreadBuy: number;
  tab: "buy" | "sell";
  setTab: (tab: "buy" | "sell") => void;
  unread: ConversationsPerProductType;
  read: ConversationsPerProductType;
  myId: string;
  selectedConversation?: { productId: string; userId?: string; key: number };
  onSelectConversation?: (args: {
    productId: string;
    userId?: string;
    key: number;
  }) => void;
};

export const ConversationsList = ({
  totalUnread,
  nrUnreadSell,
  nrUnreadBuy,
  tab,
  setTab,
  unread,
  read,
  myId,
  selectedConversation,
  onSelectConversation,
}: Props) => {
  return (
    <>
      <Display size="small">
        Du har {totalUnread} {totalUnread === 1 ? "oläst" : "olästa"}
      </Display>
      <TabRail
        tabs={[
          {
            title: "Säljer",
            onActivate: () => setTab("sell"),
            active: tab === "sell",
            ...(nrUnreadSell
              ? {
                  badge: {
                    text: nrUnreadSell.toString(),
                  },
                }
              : {}),
          },
          {
            title: "Köper",
            onActivate: () => setTab("buy"),
            active: tab === "buy",
            ...(nrUnreadBuy
              ? {
                  badge: {
                    text: nrUnreadBuy.toString(),
                  },
                }
              : {}),
          },
        ]}
      />
      <View>
        <Headline size="small">
          {tab === "buy"
            ? `Köper: ${nrUnreadBuy} ${nrUnreadSell === 1 ? "Oläst" : "Olästa"}`
            : `Säljer: ${nrUnreadSell} ${nrUnreadSell === 1 ? "Oläst" : "Olästa"}`}
        </Headline>
        {unread.length ? (
          <View style={{ marginTop: 24, gap: 16 }}>
            <ConversationCards
              conversationsGroup={unread}
              myId={myId}
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
            />
          </View>
        ) : (
          <Body size="medium" color="secondary" style={{ marginTop: 2 }}>
            Härligt! Du har läst alla meddelanden.
          </Body>
        )}
      </View>
      <Divider />
      {read.length ? (
        <AccordionSection
          initialOpen
          title={
            tab === "buy"
              ? "Köper: Alla meddelanden"
              : "Säljer: Alla meddelanden"
          }
        >
          <View style={{ gap: 16 }}>
            <ConversationCards
              conversationsGroup={read}
              myId={myId}
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
            />
          </View>
        </AccordionSection>
      ) : (
        <View style={{ gap: 2 }}>
          <Headline size="small">
            {tab === "buy"
              ? "Köper: Alla meddelanden"
              : "Säljer: Alla meddelanden"}
          </Headline>
          <Body size="medium" color="secondary">
            Här var det tomt.
          </Body>
        </View>
      )}
    </>
  );
};
