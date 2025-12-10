import { Avatar } from "@components/avatar/avatar";
import { Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable, View } from "react-native";
import dayjs from "dayjs";
import { ConversationProductQuery, MessageTypeEnum } from "@/gql/graphql";
import { SystemMessage } from "@components/messages/system-message";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";

type Props = {
  message: string;
  sender?: ConversationProductQuery["getConversation"][0]["sender"];
  type: MessageTypeEnum;
  images?: ConversationProductQuery["getConversation"][0]["images"];
  documents?: ConversationProductQuery["getConversation"][0]["documents"];
  createdAt: Date;
  alwaysShowTime?: boolean;
  senderIsMe: boolean;
  onAbortPurchase: () => void;
  onReport: () => void;
};

export const ChatBlock = ({
  message,
  sender,
  type,
  images,
  documents,
  createdAt,
  alwaysShowTime,
  senderIsMe,
  onAbortPurchase,
  onReport,
}: Props) => {
  const [showTime, setShowTime] = useState(alwaysShowTime);
  const isSystemMessage = type === MessageTypeEnum.System;
  const ref = useRef<View>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.measure((fx, fy, width, height, px, py) => {
        setMaxWidth(width);
      });
    }
  }, [message, images, documents]);

  useEffect(() => {
    setShowTime(alwaysShowTime);
  }, [alwaysShowTime]);

  return (
    <Pressable
      onPress={() => {
        setShowTime(alwaysShowTime || !showTime);
      }}
    >
      <View
        ref={ref}
        style={{ alignItems: senderIsMe ? "flex-end" : "flex-start" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          {!senderIsMe && (
            <Avatar
              style={{ marginRight: 8 }}
              placeholder={isSystemMessage ? "SYSTEM" : sender?.type}
              imageUrl={
                isSystemMessage ? undefined : sender?.profilePicture?.url
              }
            />
          )}
          {message !== "" && (
            <TextMessage
              message={message}
              senderIsMe={senderIsMe}
              isSystemMessage={isSystemMessage}
              onAbortPurchase={onAbortPurchase}
              onReport={onReport}
              maxWidth={
                maxWidth !== null
                  ? maxWidth - (!senderIsMe ? 48 : 0) - 16 - 48
                  : undefined
              }
            />
          )}
          {images && <ImageMessage images={images} />}
          {documents && (
            <DocumentMessage documents={documents} senderIsMe={senderIsMe} />
          )}
        </View>
        {showTime && (
          <Body
            size="small"
            style={{ marginLeft: 48, marginTop: 6, marginBottom: 6 }}
            color="secondary"
          >
            {dayjs(createdAt).format("HH:mm")}
          </Body>
        )}
      </View>
    </Pressable>
  );
};

type TextMessageProps = {
  message: string;
  senderIsMe: boolean;
  isSystemMessage: boolean;
  onAbortPurchase: () => void;
  onReport: () => void;
  maxWidth?: number;
};

const TextMessage = ({
  message,
  senderIsMe,
  isSystemMessage,
  onAbortPurchase,
  onReport,
  maxWidth,
}: TextMessageProps) => {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          borderTopRightRadius: borderRadius.medium,
          borderTopLeftRadius: borderRadius.medium,

          paddingHorizontal: 16,
          paddingVertical: 8,
          flex: 1,
          maxWidth,
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
          color={senderIsMe || isSystemMessage ? "primaryDark" : "primaryLight"}
        >
          {message}
        </Body>
      )}
    </View>
  );
};

type ImageMessageProps = {
  images: ConversationProductQuery["getConversation"][0]["images"];
};

const ImageMessage = ({ images }: ImageMessageProps) => {
  return (
    <View>
      {images.map((image, i) => (
        <Image
          key={i}
          source={image.url}
          style={{
            height: 160,
            borderRadius: borderRadius.medium,
            aspectRatio: 1,
          }}
        />
      ))}
    </View>
  );
};

type DocumentMessageProps = {
  documents: ConversationProductQuery["getConversation"][0]["documents"];
  senderIsMe: boolean;
};

const DocumentMessage = ({ documents, senderIsMe }: DocumentMessageProps) => {
  const colors = useThemeColor();
  return (
    <View>
      {documents.map((document, i) => (
        <View
          key={i}
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
          ]}
        >
          <Pressable onPress={() => Linking.openURL(document.url)}>
            <Body
              size="medium"
              color={senderIsMe ? "primaryDark" : "primaryLight"}
              style={{
                textDecorationLine: "underline",
                textDecorationColor: senderIsMe
                  ? colors.text.primaryDark
                  : colors.text.primaryLight,
              }}
            >
              {document.name ?? "NO_NAME"}
            </Body>
          </Pressable>
        </View>
      ))}
    </View>
  );
};
