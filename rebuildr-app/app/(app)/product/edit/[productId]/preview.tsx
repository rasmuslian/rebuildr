import {
  EditProductPreviewQuery,
  EditProductPreviewQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  PreviewScreen,
  PRODUCT_PREVIEW_FRAGMENT,
} from "@components/product/preview-screen";
import { router, useLocalSearchParams } from "expo-router";

const EDIT_PRODUCT_PREVIEW = gql`
  query EditProductPreview($input: GetProductInput!) {
    product(input: $input) {
      ...ProductPreviewFragment
    }
    me {
      id
      address
    }
  }
  ${PRODUCT_PREVIEW_FRAGMENT}
`;

export default function Preview() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useQuery<
    EditProductPreviewQuery,
    EditProductPreviewQueryVariables
  >(EDIT_PRODUCT_PREVIEW, { variables: { input: { id: productId } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <PreviewScreen
      product={data.product}
      title="Redigera annons"
      myAddress={data.me.address}
      sellerIsMe={data.me.id === data.product.sellerId}
      onDismiss={() =>
        router.dismissTo({
          pathname: "/product/[productId]",
          params: { productId },
        })
      }
      onEdit={() => (router.canGoBack() ? router.back() : router.replace("/"))}
    />
  );
}
