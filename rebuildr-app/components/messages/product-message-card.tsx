import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { AdDescription } from "@components/cards/ad-grid";
import { Divider } from "@components/dividers/divider";
import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { ComponentProps } from "react";
import { View } from "react-native";

type Props = {
  adDescription: ComponentProps<typeof AdDescription>;
  adImage?: string;
  messages: {
    sender: {
      senderIsMe: boolean;
      username: string;
      url?: string;
    };
    message: string;
    createdAt: Date;
    readAt?: Date;
  }[];
};

export const ProductMessageCard = ({
  adDescription,
  adImage,
  messages,
}: Props) => {
  const colors = useThemeColor();

  const timeAgoString = (messageCreatedAt: Date) => {
    const diffHours = dayjs().diff(dayjs(messageCreatedAt), "hour");
    const diffDays = dayjs().diff(dayjs(messageCreatedAt), "day");

    if (diffDays >= 1) {
      return `${diffDays} dag${diffDays > 1 ? "ar" : ""} sen`;
    }
    if (diffHours >= 1) {
      return `${diffHours} timm${diffHours > 1 ? "ar" : "e"} sen`;
    }
    return "Meddelande nyligen";
  };

  const nrOfUnread = messages.reduce(
    (acc, curr) => acc + (!curr.sender.senderIsMe && !curr.readAt ? 1 : 0),
    0,
  );

  return (
    <View
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
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View style={{ flex: 1 }}>
          <AdDescription {...adDescription} />
        </View>
        <Image
          source={{ uri: adImage }}
          style={{ width: 80, height: 80, borderRadius: borderRadius.small }}
        />
      </View>
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
          />
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
            />
          </View>
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
                {timeAgoString(messages[0].createdAt)}
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
    </View>
  );
};
