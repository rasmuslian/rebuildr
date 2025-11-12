import {
  CreateMessageMutation,
  CreateMessageMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import * as Sentry from "@sentry/react-native";

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      message
      messageType
      createdAt
      imagePutUrls
      documentPutUrls
      sender {
        id
        type
        username
        profilePicture {
          id
          url
        }
      }
      receiver {
        id
        username
        profilePicture {
          id
          url
        }
      }
    }
  }
`;

type OnCreateMessageProps = {
  receiverId: string;
  productId: string;
  message: string;
  images?: { mimeType: string; file: File }[];
  documents?: { mimeType: string; file: File; name: string }[];
  onCompleted?: () => void;
};

export const useCreateMessage = () => {
  const [createMessage, { loading }] = useMutation<
    CreateMessageMutation,
    CreateMessageMutationVariables
  >(CREATE_MESSAGE);

  const onCreateMessage = ({
    receiverId,
    productId,
    message,
    images,
    documents,
    onCompleted,
  }: OnCreateMessageProps) => {
    if (loading || (!images && !documents && !message.trim())) {
      return;
    }

    createMessage({
      variables: {
        input: {
          receiverId,
          productId,
          message,
          images: images
            ? images.map((i) => ({ mimeType: i.mimeType }))
            : undefined,
          documents: documents
            ? documents.map((d) => ({ mimeType: d.mimeType, name: d.name }))
            : undefined,
        },
      },
      onCompleted: async (data) => {
        let mediaPromises: Promise<void>[] = [];
        if (data.createMessage.imagePutUrls) {
          mediaPromises = [
            ...mediaPromises,
            ...data.createMessage.imagePutUrls.map(async (putUrl, index) => {
              const image = images?.[index];
              if (image) {
                await fetch(putUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type": image.mimeType,
                    "x-amz-acl": "public-read",
                  },
                  body: image.file,
                });
              }
            }),
          ];
        }
        if (data.createMessage.documentPutUrls) {
          mediaPromises = [
            ...mediaPromises,
            ...data.createMessage.documentPutUrls.map(async (putUrl, index) => {
              const doc = documents?.[index];
              if (doc) {
                await fetch(putUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type": doc.mimeType,
                    "x-amz-acl": "public-read",
                  },
                  body: doc.file,
                });
              }
            }),
          ];
        }
        if (mediaPromises.length) {
          try {
            await Promise.all(mediaPromises);
          } catch (e) {
            Sentry.captureException(e);
          } finally {
            onCompleted?.();
          }
        }
      },
    });
  };

  return {
    loading,
    onCreateMessage,
  };
};
