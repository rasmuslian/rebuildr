import { gql, useMutation } from "@apollo/client";
import {
  ProductViewLikeProductMutation,
  ProductViewLikeProductMutationVariables,
} from "@/gql/graphql";

import { MY_FAVORITES } from "@/app/(app)/account/favorites";
import { useUser } from "@hooks/useUser";

const PRODUCT_VIEW_LIKE_PRODUCT = gql`
  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {
    setLikeProduct(input: $input) {
      id
      likedByMe
    }
  }
`;

type onToggleProductHeartProps = {
  productId: string;
  likedByMe: boolean;
};

export const useLikeProduct = () => {
  const { isLoggedIn } = useUser();

  const [setLikeProduct, { loading }] = useMutation<
    ProductViewLikeProductMutation,
    ProductViewLikeProductMutationVariables
  >(PRODUCT_VIEW_LIKE_PRODUCT);

  const onToggleProductHeart = ({
    productId,
    likedByMe,
  }: onToggleProductHeartProps) => {
    if (!isLoggedIn || loading) return;

    setLikeProduct({
      variables: {
        input: {
          id: productId,
          like: !likedByMe,
        },
      },
      refetchQueries: [MY_FAVORITES],
    });
  };

  return {
    loading,
    onToggleProductHeart,
  };
};
