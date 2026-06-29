import { gql, useMutation } from "@apollo/client";
import {
  SetProductVisibilityMutation,
  SetProductVisibilityMutationVariables,
  ProductVisibilityEnum,
} from "@/gql/graphql";
import { PRODUCT_VIEW_FRAGMENT } from "@/queries/product-view-fragment";

const SET_PRODUCT_VISIBILITY = gql`
  mutation SetProductVisibility($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        ...ProductViewFragment
      }
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

export const useSetProductVisibility = () => {
  const [mutate, { loading }] = useMutation<
    SetProductVisibilityMutation,
    SetProductVisibilityMutationVariables
  >(SET_PRODUCT_VISIBILITY);

  const setVisibility = (id: string, visibility: ProductVisibilityEnum) =>
    mutate({ variables: { input: { id, visibility } } });

  return { setVisibility, loading };
};
