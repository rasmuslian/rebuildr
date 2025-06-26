import {
  EditProductScreenQuery,
  EditProductScreenQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  EditProductScreen,
  PRODUCT_DETAILS_FRAGMENT,
} from "@components/product/edit-product-screen";
import { useLocalSearchParams } from "expo-router";

const EDIT_PRODUCT_SCREEN = gql`
  query EditProductScreen($input: GetProductInput!) {
    product(input: $input) {
      ...ProductDetailsFragment
    }
    me {
      id
      selectedPayoutMethod
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

export default function EditProduct() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useQuery<
    EditProductScreenQuery,
    EditProductScreenQueryVariables
  >(EDIT_PRODUCT_SCREEN, { variables: { input: { id: productId } } });

  if (!data?.product) {
    return <LoadingSpinner />;
  }

  return (
    <EditProductScreen
      product={data.product}
      title="Redigera annons"
      nextUrl={{
        pathname: "/product/edit/[productId]/project",
        params: { productId },
      }}
    />
  );
}
