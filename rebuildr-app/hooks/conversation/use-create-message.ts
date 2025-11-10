import {
  CreateMessageMutation,
  CreateMessageMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      message
      messageType
      createdAt
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
    onCompleted,
  }: OnCreateMessageProps) => {
    if (loading || !message.trim()) {
      return;
    }

    createMessage({
      variables: {
        input: {
          receiverId,
          productId,
          message,
        },
      },
      onCompleted,
    });
  };

  return {
    loading,
    onCreateMessage,
  };
};
