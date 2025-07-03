import { gql, useMutation, useReactiveVar } from "@apollo/client";
import {
  ProjectLikeMutation,
  ProjectLikeMutationVariables,
} from "@/gql/graphql";

import { isLoggedInVar } from "@/apollo/config";
import { MY_FAVORITES } from "@/app/(app)/account/favorites";
import { MY_ACCOUNT } from "@/app/(app)/account";

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
  const isLoggedIn = useReactiveVar(isLoggedInVar);

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
      refetchQueries: [MY_FAVORITES, MY_ACCOUNT],
    });
  };

  return {
    loading,
    onToggleProjectHeart,
  };
};
