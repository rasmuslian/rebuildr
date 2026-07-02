import { gql, useMutation } from "@apollo/client";
import {
  MarkProductAvailableMutation,
  MarkProductAvailableMutationVariables,
  ProductAvailabilityEnum,
} from "@/gql/graphql";
import { PRODUCT_VIEW_FRAGMENT } from "@/queries/product-view-fragment";

const MARK_PRODUCT_AVAILABLE = gql`
  mutation MarkProductAvailable($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        ...ProductViewFragment
      }
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

export const useMarkProductAvailable = () => {
  const [mutate, { loading }] = useMutation<
    MarkProductAvailableMutation,
    MarkProductAvailableMutationVariables
  >(MARK_PRODUCT_AVAILABLE);

  // Convert a "coming soon" listing to available now (clears the date).
  const markAvailable = (id: string) =>
    mutate({
      variables: {
        input: {
          id,
          availability: ProductAvailabilityEnum.Available,
          estimatedAvailableAt: null,
          availabilityPrecision: null,
        },
      },
    });

  return { markAvailable, loading };
};
