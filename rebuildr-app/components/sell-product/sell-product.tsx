import { SellProductQueryQuery } from "@/gql/graphql";
import { gql, useLazyQuery } from "@apollo/client";
import { useSellProductContext } from "@context/sell-product-context";
import { UpsertProduct } from "@components/upsert-product/upsert-product";
import { PublishSuccessSheet } from "@components/publish-success-sheet/publish-success-sheet";
import { PublishedProductData } from "@components/upsert-product/types";
import { useEffect, useState } from "react";

const SELL_PRODUCT_QUERY = gql`
  query SellProductQuery {
    getOrCreateDraftProduct {
      id
    }
  }
`;

export const SellProduct = () => {
  const { visible, setVisible } = useSellProductContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [publishedProduct, setPublishedProduct] =
    useState<PublishedProductData | null>(null);

  const [getOrCreateDraft, { data, loading }] =
    useLazyQuery<SellProductQueryQuery>(SELL_PRODUCT_QUERY, {
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (visible) {
      getOrCreateDraft();
    }
  }, [visible]);

  return (
    <>
      <UpsertProduct
        productId={data?.getOrCreateDraftProduct?.id}
        mode="create"
        visible={visible}
        loading={!data?.getOrCreateDraftProduct?.id || loading}
        onHide={() => {
          setVisible(false);
        }}
        onPublished={(product) => {
          setVisible(false);
          if (product) {
            setPublishedProduct(product);
            setShowSuccess(true);
          }
        }}
      />
      <PublishSuccessSheet
        open={showSuccess}
        onDismiss={() => {
          setShowSuccess(false);
          setPublishedProduct(null);
        }}
        product={publishedProduct}
      />
    </>
  );
};
