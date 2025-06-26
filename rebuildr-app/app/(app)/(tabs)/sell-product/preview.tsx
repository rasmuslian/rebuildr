import { PreviewDraftedProductQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { router } from "expo-router";
import {
  PreviewScreen,
  PRODUCT_PREVIEW_FRAGMENT,
} from "@components/product/preview-screen";

const PREVIEW_DRAFTED_PRODUCT = gql`
  query PreviewDraftedProduct {
    getDraftedProduct {
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
  const { data } = useQuery<PreviewDraftedProductQuery>(
    PREVIEW_DRAFTED_PRODUCT,
  );

  if (!data) {
    return <LoadingSpinner />;
  }
  if (!data.getDraftedProduct) {
    router.replace("/");
    return null;
  }

  return (
    <PreviewScreen
      product={data.getDraftedProduct}
      title="Ny annons"
      myAddress={data.me.address}
      sellerIsMe={data.me.id === data.getDraftedProduct.sellerId}
    />
  );
}
