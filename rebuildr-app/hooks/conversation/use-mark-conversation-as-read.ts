import {
  MarkConversationAsReadMutation,
  MarkConversationAsReadMutationVariables,
} from "@/gql/graphql";
import { DocumentNode, gql, useMutation } from "@apollo/client";

const MARK_CONVERSATION_AS_READ = gql`
  mutation MarkConversationAsRead($input: MarkAsReadInput!) {
    markConversationAsRead(input: $input) {
      id
      readAt
    }
  }
`;

type UseMarkConversationAsReadProps = {
  otherUserId: string;
  productId: string;
  refetchQueries?: DocumentNode[];
};

export const useMarkConversationAsRead = () => {
  const [markConversationAsRead] = useMutation<
    MarkConversationAsReadMutation,
    MarkConversationAsReadMutationVariables
  >(MARK_CONVERSATION_AS_READ);

  const onMarkConversationAsRead = ({
    otherUserId,
    productId,
    refetchQueries,
  }: UseMarkConversationAsReadProps) => {
    markConversationAsRead({
      variables: {
        input: {
          otherUserId,
          productId,
          markAsRead: true,
        },
      },
      refetchQueries,
    });
  };

  return {
    onMarkConversationAsRead,
  };
};
