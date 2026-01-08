import { TextInput } from "@components/forms/textInput";
import { useCreateMessage } from "@hooks/conversation/use-create-message";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useImageHandler } from "@hooks/use-image-handler";
import { useState } from "react";
import { Pressable, View } from "react-native";
import SendVector from "@assets/svgs/send-vector.svg";
import { Image } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  receiverId: string;
  productId: string;
  onMessageSent?: () => void;
};

export const MessageInput = ({
  receiverId,
  productId,
  onMessageSent,
}: Props) => {
  const [message, setMessage] = useState("");

  const { loading: createMessageLoading, onCreateMessage } = useCreateMessage();
  const { pickDocument } = useDocumentHandler();
  const { pickImage } = useImageHandler();
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const onPickImage = async () => {
    const image = await pickImage();
    if (!image) return;
    onSendMessage({
      message,
      images: [{ mimeType: image.mimeType, file: image.file }],
    });
  };

  const onPickDocument = async () => {
    const document = await pickDocument();
    if (!document) return;

    onSendMessage({
      message,
      documents: [
        {
          mimeType: document.mimeType,
          file: document.file,
          name: document.name,
        },
      ],
    });
  };

  const onSendMessage = (input: {
    message: string;
    images?: { mimeType: string; file: File }[];
    documents?: { mimeType: string; file: File; name: string }[];
  }) => {
    if (createMessageLoading) {
      return;
    }

    onCreateMessage({
      receiverId,
      productId,
      ...input,
      onCompleted: () => {
        setMessage("");
        onMessageSent?.();
      },
    });
  };

  return (
    <View style={{ gap: 16, flexDirection: "row", alignItems: "flex-end" }}>
      <View style={{ flex: 1 }}>
        <TextInput
          value={message}
          placeholder="Skriv ett meddelande..."
          onChange={setMessage}
          multiline
          style={{ height: 80, paddingTop: 8 }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") {
              onSendMessage({ message });
            }
          }}
          trailing={[
            { icon: "paperclip", onPress: onPickDocument },
            {
              icon: "addPhoto",
              onPress: onPickImage,
            },
          ]}
        />
      </View>
      {!isDesktop && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 25,
            backgroundColor: colors.badges.large,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => onSendMessage({ message })}>
            {createMessageLoading ? (
              <LoadingSpinner />
            ) : (
              <Image
                source={SendVector.uri}
                style={{ width: 19, height: 16 }}
              />
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};
