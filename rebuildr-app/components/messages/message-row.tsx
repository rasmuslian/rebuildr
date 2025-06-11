import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import { dateToTimeAgoString } from "./utils";
import { Badge } from "@components/badges/badge";
import { Avatar } from "@components/avatar/avatar";
import { UserType } from "@/gql/graphql";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  message: {
    otherUser: {
      userType: UserType;
      username?: string | null;
      url?: string;
    };
    message: string;
    createdAt: Date;
    readAt?: Date;
    productId: string;
  };
};

export const MessageRow = ({ message }: Props) => {
  const colors = useThemeColor();

  return (
    <Pressable
      onPress={() => {
        /**TODO: navigate to chat */
      }}
      style={[
        {
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        },
      ]}
    >
      <Avatar
        userType={message.otherUser.userType}
        imageUrl={message.otherUser.url}
      />
      <View
        style={[
          {
            flex: 1,
            borderRadius: borderRadius.medium,
          },
          message.readAt
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
            <Label size="large">{message.otherUser.username}</Label>
            <Body size="small" numberOfLines={1}>
              {message.message}
            </Body>
          </View>
          {message.readAt ? <View /> : <Badge text="Oläst" />}
        </View>
        <Body size="small" color="secondary" style={{ marginTop: 4 }}>
          {dateToTimeAgoString(message.createdAt)}
        </Body>
      </View>
    </Pressable>
  );
};
