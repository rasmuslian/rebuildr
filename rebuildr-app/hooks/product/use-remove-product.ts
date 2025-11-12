import { gql, useMutation } from "@apollo/client";
import {
  ProductRemoveProductMutation,
  ProductRemoveProductMutationVariables,
} from "@/gql/graphql";
import { PRODUCT_VIEW_FRAGMENT } from "@/queries/product-view-fragment";

const PRODUCT_REMOVE_PRODUCT = gql`
  mutation ProductRemoveProduct($input: RemoveProductInput!) {
    removeProduct(input: $input) {
      ...ProductViewFragment
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

export const useRemoveProduct = () => {
  const [removeProduct, { loading }] = useMutation<
    ProductRemoveProductMutation,
    ProductRemoveProductMutationVariables
  >(PRODUCT_REMOVE_PRODUCT);

  return {
    loading,
    removeProduct,
  };
};
