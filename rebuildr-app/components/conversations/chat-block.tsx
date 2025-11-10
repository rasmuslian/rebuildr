import { Avatar } from "@components/avatar/avatar";
import { Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import dayjs from "dayjs";
import { ConversationProductQuery, MessageTypeEnum } from "@/gql/graphql";
import { SystemMessage } from "@components/messages/system-message";

type Props = {
  message: string;
  sender?: ConversationProductQuery["getConversation"][0]["sender"];
  type: MessageTypeEnum;
  createdAt: Date;
  senderIsMe: boolean;
  onAbortPurchase: () => void;
  onReport: () => void;
};

export const ChatBlock = ({
  message,
  sender,
  type,
  createdAt,
  senderIsMe,
  onAbortPurchase,
  onReport,
}: Props) => {
  const colors = useThemeColor();

  const isSystemMessage = type === MessageTypeEnum.System;

  return (
    <View style={{ alignItems: senderIsMe ? "flex-end" : "flex-start" }}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        {!senderIsMe && (
          <Avatar
            placeholder={isSystemMessage ? "SYSTEM" : sender?.type}
            imageUrl={isSystemMessage ? undefined : sender?.profilePicture?.url}
          />
        )}
        <View
          style={[
            {
              borderTopRightRadius: borderRadius.medium,
              borderTopLeftRadius: borderRadius.medium,

              paddingHorizontal: 16,
              paddingVertical: 8,
              flex: 1,
            },
            senderIsMe
              ? {
                  borderBottomRightRadius: borderRadius.xSmall,
                  borderBottomLeftRadius: borderRadius.medium,
                  backgroundColor: colors.background.secondary,
                  marginLeft: 48,
                }
              : {
                  backgroundColor: colors.buttons.filled.enabled,
                  borderBottomRightRadius: borderRadius.medium,
                  borderBottomLeftRadius: borderRadius.xSmall,
                  marginRight: 48,
                },
            isSystemMessage && {
              backgroundColor: colors.buttons.tonal.enabled,
            },
          ]}
        >
          {isSystemMessage ? (
            <SystemMessage
              text={message}
              onAbortPurchase={onAbortPurchase}
              onReport={onReport}
            />
          ) : (
            <Body
              size="large"
              color={
                senderIsMe || isSystemMessage ? "primaryDark" : "primaryLight"
              }
            >
              {message}
            </Body>
          )}
        </View>
      </View>
      <Body
        size="small"
        style={{ marginLeft: 48, marginTop: 6 }}
        color="secondary"
      >
        {dayjs(createdAt).format("HH:mm")}
      </Body>
    </View>
  );
};
