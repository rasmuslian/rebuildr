import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable, View } from "react-native";
import { Badge } from "@components/badges/badge";
import { Avatar } from "@components/avatar/avatar";
import {
  Conversation,
  MessageTypeEnum,
  ProductConversationsQuery,
  UserType,
} from "@/gql/graphql";
import dayjs from "dayjs";
import { router } from "expo-router";
import { parseSystemMessagePreview } from "./system-message";

type Props = {
  otherUser: {
    id: string;
    userType: UserType;
    username?: string | null;
    url?: string;
  };
  conversation: NonNullable<
    ProductConversationsQuery["getConversations"][number]
  >;
  myId: string;
  onConversationsPress?: (conversation: {
    conversationId: string;
    key: number;
  }) => void;
};

export const ConversationRow = ({
  otherUser,
  conversation,
  myId,
  onConversationsPress,
}: Props) => {
  const colors = useThemeColor();

  const isUnread = (c: Conversation) => {
    if (!c.lastMessage || c.lastMessage.sender?.id === myId) return false;
    const lastAt = new Date(c.lastMessage.createdAt);
    const readAt = c.buyer.id === myId ? c.buyerReadAt : c.sellerReadAt;
    if (c.buyerReadAt) {
    }
    return lastAt > new Date(readAt);
  };

  const handlePress = () => {
    if (onConversationsPress) {
      onConversationsPress({
        conversationId: conversation.id,
        key: 0,
      });
    } else {
      router.navigate({
        pathname: "/conversation/[conversationId]",
        params: {
          conversationId: conversation.id,
        },
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        {
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        },
      ]}
    >
      <Avatar placeholder={otherUser.userType} imageUrl={otherUser.url} />
      <View
        style={[
          {
            flex: 1,
            borderRadius: borderRadius.medium,
          },
          !isUnread(conversation as Conversation)
            ? {
                backgroundColor: colors.buttons.tonal.enabled,
                paddingHorizontal: 17,
                paddingVertical: 13,
              }
            : {
                borderWidth: 1,
                borderColor: colors.text.link,
                paddingHorizontal: 16,
                paddingVertical: 12,
              },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Label size="large">{otherUser.username}</Label>
            <Body size="small" numberOfLines={1}>
              {conversation.lastMessage?.messageType === MessageTypeEnum.System
                ? parseSystemMessagePreview(conversation.lastMessage.message)
                : conversation.lastMessage?.message}
            </Body>
          </View>
          {isUnread(conversation as Conversation) ? (
            <Badge text="Oläst" />
          ) : (
            <View />
          )}
        </View>
        <Body size="small" color="secondary" style={{ marginTop: 4 }}>
          {dayjs(conversation.lastMessage?.createdAt)?.fromNow()}
        </Body>
      </View>
    </Pressable>
  );
};
