import { Divider } from "@components/dividers/divider";
import { AccordionSection } from "@components/sections/accordion-section";
import { TabRail } from "@components/tabs/tab-rail";
import { Body, Display, Headline } from "@components/typography/text";
import { View } from "react-native";
import { ConversationsPerProductType } from "@/utils/conversations/parse-conversations";
import { ConversationGroupCards } from "./conversation-group-cards";

type Props = {
  totalUnread: number;
  nrUnreadSell: number;
  nrUnreadBuy: number;
  tab: "buy" | "sell";
  setTab: (tab: "buy" | "sell") => void;
  unread: ConversationsPerProductType;
  read: ConversationsPerProductType;
  myId: string;
  selectedConversationGroup?: { productId: string; key: number };
  onSelectConversationGroup?: (args: {
    productId: string;
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
  selectedConversationGroup,
  onSelectConversationGroup,
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
            <ConversationGroupCards
              conversationsGroups={unread}
              myId={myId}
              selectedProductId={selectedConversationGroup?.productId ?? ""}
              onSelect={onSelectConversationGroup}
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
            <ConversationGroupCards
              conversationsGroups={read}
              myId={myId}
              selectedProductId={selectedConversationGroup?.productId ?? ""}
              onSelect={onSelectConversationGroup}
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
