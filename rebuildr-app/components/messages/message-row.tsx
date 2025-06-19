import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import { Badge } from "@components/badges/badge";
import { Avatar } from "@components/avatar/avatar";
import { UserType } from "@/gql/graphql";
import { Pressable } from "react-native-gesture-handler";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  otherUser: {
    id: string;
    userType: UserType;
    username?: string | null;
    url?: string;
  };
  message: {
    sender: { id: string };
    message: string;
    createdAt: Date;
    readAt?: Date;
    productId: string;
  };
  myId: string;
};

export const MessageRow = ({ otherUser, message, myId }: Props) => {
  const colors = useThemeColor();

  const sendeIsMe = myId === message.sender.id;

  return (
    <Pressable
      onPress={() => {
        router.navigate({
          pathname: "/conversations/[productId]/[userId]",
          params: {
            productId: message.productId,
            userId: otherUser.id,
          },
        });
      }}
      style={[
        {
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        },
      ]}
    >
      <Avatar userType={otherUser.userType} imageUrl={otherUser.url} />
      <View
        style={[
          {
            flex: 1,
            borderRadius: borderRadius.medium,
          },
          message.readAt || sendeIsMe
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
              {message.message}
            </Body>
          </View>
          {message.readAt || sendeIsMe ? <View /> : <Badge text="Oläst" />}
        </View>
        <Body size="small" color="secondary" style={{ marginTop: 4 }}>
          {dayjs(message.createdAt).fromNow()}
        </Body>
      </View>
    </Pressable>
  );
};
