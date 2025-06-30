import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Divider } from "@components/dividers/divider";
import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { ComponentProps } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { AdList } from "@components/ad/ad-list";
import dayjs from "dayjs";
import { GetConversationsQuery } from "@/gql/graphql";

type Props = {
  adList: ComponentProps<typeof AdList>;
  myId: string;
  messages: {
    sender: GetConversationsQuery["getConversations"][0]["sender"];
    receiver: GetConversationsQuery["getConversations"][0]["receiver"];
    message: string;
    createdAt: Date;
    readAt?: Date;
  }[];
  onPress: () => void;
};

export const ProductMessageCard = ({
  adList,
  myId,
  messages,
  onPress,
}: Props) => {
  const colors = useThemeColor();

  const nrOfUnread = messages.reduce(
    (acc, curr) => acc + (curr.sender.id !== myId && !curr.readAt ? 1 : 0),
    0,
  );

  const getOtherUser = (message: (typeof messages)[0]) =>
    message.receiver.id === myId ? message.sender : message.receiver;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderRadius: borderRadius.medium,
          gap: 12,
        },
        nrOfUnread > 0
          ? {
              borderWidth: 1,
              borderColor: colors.text.link,
              paddingTop: 16,
              paddingBottom: 12,
              paddingHorizontal: 16,
            }
          : {
              paddingTop: 17,
              paddingBottom: 13,
              paddingHorizontal: 17,
              backgroundColor: colors.buttons.tonal.enabled,
            },
      ]}
    >
      <AdList {...adList} />
      <Divider />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <View style={{ minWidth: 52 }}>
          <Avatar
            size={32}
            style={{
              borderWidth: 2,
              borderColor: colors.text.primaryLight,
              borderRadius: 38,
            }}
            userType={getOtherUser(messages[0]).type}
            imageUrl={getOtherUser(messages[0]).profilePicture?.url}
          />
          {messages[1] && (
            <View
              style={{
                position: "absolute",
                left: 20,
                top: 0,
              }}
            >
              <Avatar
                size={32}
                style={{
                  borderWidth: 2,
                  borderColor: colors.text.primaryLight,
                  borderRadius: 38,
                }}
                userType={getOtherUser(messages[1]).type}
                imageUrl={getOtherUser(messages[1]).profilePicture?.url}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          {messages.length > 0 && (
            <View style={{ width: "100%" }}>
              <Label size="medium" numberOfLines={1}>
                {messages.length === 1
                  ? `${messages[0].sender.username}: ${messages[0].message}`
                  : `${messages[0].sender.username} och ${messages.length - 1} ${messages.length > 2 ? "andra" : "annan"}`}
              </Label>
              <Body size="small" color="secondary">
                {dayjs(messages[0].createdAt).fromNow()}
              </Body>
            </View>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {nrOfUnread > 0 ? (
            <Badge
              text={`${nrOfUnread} ${nrOfUnread > 1 ? "olästa" : "oläst"}`}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    </Pressable>
  );
};
