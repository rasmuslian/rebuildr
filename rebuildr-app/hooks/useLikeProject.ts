import { gql, useMutation } from "@apollo/client";
import {
  ProjectLikeMutation,
  ProjectLikeMutationVariables,
} from "@/gql/graphql";

import { useUser } from "@hooks/useUser";
import { MY_FAVORITES } from "@components/account/queries";

const PROJECT_LIKE_MUTATION = gql`
  mutation ProjectLike($input: SetLikeProjectInput!) {
    setLikeProject(input: $input) {
      id
      likedByMe
    }
  }
`;

type onToggleProjectHeartProps = {
  projectId: string;
  likedByMe: boolean;
};

export const useLikeProject = () => {
  const { isLoggedIn } = useUser();

  const [setLikeProject, { loading }] = useMutation<
    ProjectLikeMutation,
    ProjectLikeMutationVariables
  >(PROJECT_LIKE_MUTATION);

  const onToggleProjectHeart = ({
    projectId,
    likedByMe,
  }: onToggleProjectHeartProps) => {
    if (!isLoggedIn || loading) return;

    setLikeProject({
      variables: {
        input: {
          id: projectId,
          like: !likedByMe,
        },
      },
      refetchQueries: [MY_FAVORITES],
    });
  };

  return {
    loading,
    onToggleProjectHeart,
  };
};
