import { ConversationProductQuery } from "@/gql/graphql";
import { AbortPurchaseBottomSheet } from "@components/abort-purchase/abort-purchase-bottom-sheet";
import { ChatBlock } from "@components/conversations/chat-block";
import { ReportPurchaseBottomSheet } from "@components/report/report-purchase-bottom-sheet";
import { CreateReview } from "@components/review/create-review";
import { Body } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import dayjs from "dayjs";

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

  const groupByUserAndTime = (messages: (typeof conversationByDate)[0]) => {
    return messages.reduce(
      (acc: (typeof conversationByDate)[0][], curr, i, arr) => {
        const prevMessage = arr[i - 1];
        //Create new group!
        if (!prevMessage) {
          return [...acc, [curr]];
        }
        if (prevMessage.sender.id !== curr.sender.id) {
          return [...acc, [curr]];
        }
        if (prevMessage.messageType !== curr.messageType) {
          return [...acc, [curr]];
        }
        const diffInTime = dayjs(curr.createdAt).diff(
          dayjs(prevMessage.createdAt),
          "minutes",
        );
        if (diffInTime > 5) {
          return [...acc, [curr]];
        }

        //Add to latest group
        const lastIndex = acc.length - 1;
        const currentGroup = acc[lastIndex] ?? [];
        const newAcc = [...acc];
        newAcc[lastIndex] = [...currentGroup, curr];
        return newAcc;
      },
      [],
    );
  };
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
            <View style={{ gap: 2 }}>
              {groupByUserAndTime(messages).map((group) => {
                const sender = group[0]?.sender;
                const senderIsMe = sender.id === data.me.id;
                return group.map((message, i, arr) => (
                  <ChatBlock
                    key={i}
                    message={message.message}
                    type={message.messageType}
                    sender={message.sender}
                    createdAt={message.createdAt}
                    alwaysShowTime={i === arr.length - 1}
                    images={message.images}
                    documents={message.documents}
                    senderIsMe={senderIsMe}
                    onAbortPurchase={() => setShowAbortSheet(true)}
                    onReport={() => setShowReportSheet(true)}
                  />
                ));
              })}
            </View>
          </View>
        );
      })}
      {data.latestPurchase && (
        <AbortPurchaseBottomSheet
          purchaseId={data.latestPurchase.id}
          purchaseStatus={data.latestPurchase.status}
          show={showAbortSheet}
          onDismiss={() => setShowAbortSheet(false)}
          onAbortPurchaseCompleted={() => refetch()}
        />
      )}
      {data.latestPurchase && (
        <CreateReview
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
