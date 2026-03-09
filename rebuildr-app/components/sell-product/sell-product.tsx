import { SellProductQueryQuery } from "@/gql/graphql";
import { gql, useLazyQuery } from "@apollo/client";
import { useSellProductContext } from "@context/sell-product-context";
import { UpsertProduct } from "@components/upsert-product/upsert-product";
import { useEffect } from "react";

const SELL_PRODUCT_QUERY = gql`
  query SellProductQuery {
    getOrCreateDraftProduct {
      id
    }
  }
`;

export const SellProduct = () => {
  const { visible, setVisible } = useSellProductContext();

  const [getOrCreateDraft, { data, loading }] =
    useLazyQuery<SellProductQueryQuery>(SELL_PRODUCT_QUERY, {
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (visible) {
      getOrCreateDraft();
    }
  }, [visible]);

  if (!data || loading) {
    return null;
  }

  return (
    <UpsertProduct
      productId={data.getOrCreateDraftProduct.id}
      mode="create"
      visible={visible}
      onHide={() => {
        setVisible(false);
      }}
      onPublished={() => {
        setVisible(false);
      }}
    />
  );
};
