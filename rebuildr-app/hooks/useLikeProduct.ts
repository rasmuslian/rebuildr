import { gql, useMutation } from "@apollo/client";
import {
  ProductViewLikeProductMutation,
  ProductViewLikeProductMutationVariables,
} from "@/gql/graphql";

const PRODUCT_VIEW_LIKE_PRODUCT = gql`
  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {
    setLikeProduct(input: $input) {
      id
      likedByMe
    }
  }
`;

export const useLikeProduct = () => {
  const [setLikeProduct, { loading }] = useMutation<
    ProductViewLikeProductMutation,
    ProductViewLikeProductMutationVariables
  >(PRODUCT_VIEW_LIKE_PRODUCT);

  type onToggleHeartProps = {
    productId: string;
    likedByMe: boolean;
  };

  const onToggleHeart = ({ productId, likedByMe }: onToggleHeartProps) => {
    if (loading) return;
    setLikeProduct({
      variables: {
        input: {
          id: productId,
          like: !likedByMe,
        },
      },
    });
  };

  return {
    loading,
    onToggleHeart,
  };
};
