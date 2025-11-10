import { ConversationProductQuery } from "@/gql/graphql";
import { AbortPurchaseBottomSheet } from "@components/abort-purchase/abort-purchase-bottom-sheet";
import { ChatBlock } from "@components/conversations/chat-block";
import { ReportPurchaseBottomSheet } from "@components/report/report-purchase-bottom-sheet";
import { CreateReviewBottomSheet } from "@components/review/create-review-bottom-sheet";
import { Body } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  data: ConversationProductQuery;
  refetch: () => void;
  showReviewSheet: boolean;
  setShowReviewSheet: (show: boolean) => void;
};

export const Conversation = ({
  data,
  refetch,
  showReviewSheet,
  setShowReviewSheet,
}: Props) => {
  const colors = useThemeColor();
  const [showAbortSheet, setShowAbortSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  const conversationByDate = data.getConversation
    .slice()
    .reverse()
    .reduce(
      (acc: { [key in string]: (typeof data.getConversation)[0][] }, curr) => {
        const key = dayjs(curr.createdAt).format("DD MMM YYYY");
        return { ...(acc ?? {}), [key]: [...(acc[key] ?? []), curr] };
      },
      {},
    );
  return (
    <>
      {Object.entries(conversationByDate).map((entry) => {
        const date = entry[0];
        const messages = entry[1];

        return (
          <View key={date}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginVertical: 16,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dividers.neutral,
                }}
              />
              <Body size="small" color="secondary">
                {date}
              </Body>
              <View
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dividers.neutral,
                }}
              />
            </View>
            <View style={{ gap: 8 }}>
              {messages.map((message, i) => {
                const senderIsMe = message.sender.id === data.me.id;
                return (
                  <ChatBlock
                    key={i}
                    message={message.message}
                    type={message.messageType}
                    sender={message.sender}
                    createdAt={message.createdAt}
                    senderIsMe={senderIsMe}
                    onAbortPurchase={() => setShowAbortSheet(true)}
                    onReport={() => setShowReportSheet(true)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
      {data.latestPurchase && (
        <AbortPurchaseBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showAbortSheet}
          onDismiss={() => setShowAbortSheet(false)}
          onAbortPurchaseCompleted={() => refetch()}
        />
      )}
      {data.latestPurchase && (
        <CreateReviewBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showReviewSheet}
          onDismiss={() => setShowReviewSheet(false)}
          onCreateReviewCompleted={() => {
            refetch();
          }}
        />
      )}
      {data.latestPurchase && (
        <ReportPurchaseBottomSheet
          purchaseId={data.latestPurchase.id}
          show={showReportSheet}
          onDismiss={() => setShowReportSheet(false)}
          onCreateReportComplete={() => refetch()}
        />
      )}
    </>
  );
};
