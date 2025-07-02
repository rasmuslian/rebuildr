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

type onToggleHeartProps = {
  productId: string;
  likedByMe: boolean;
  onCompleted?: () => void;
  onError?: () => void;
};

export const useLikeProduct = () => {
  const [setLikeProduct, { loading }] = useMutation<
    ProductViewLikeProductMutation,
    ProductViewLikeProductMutationVariables
  >(PRODUCT_VIEW_LIKE_PRODUCT);

  const onToggleHeart = ({
    productId,
    likedByMe,
    onCompleted,
    onError,
  }: onToggleHeartProps) => {
    if (loading) return;
    setLikeProduct({
      variables: {
        input: {
          id: productId,
          like: !likedByMe,
        },
      },
      onCompleted,
      onError,
    });
  };

  return {
    loading,
    onToggleHeart,
  };
};
