import { TextInput } from "@components/forms/textInput";
import { useCreateMessage } from "@hooks/conversation/use-create-message";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useImageHandler } from "@hooks/use-image-handler";
import { useState } from "react";

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
    <TextInput
      value={message}
      placeholder="Skriv ditt meddelande..."
      onChange={setMessage}
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
  );
};
