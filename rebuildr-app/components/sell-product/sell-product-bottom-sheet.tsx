import { SellProductBottomSheetQueryQuery } from "@/gql/graphql";
import { gql, useLazyQuery } from "@apollo/client";
import { useSellProductContext } from "@context/sell-product-context";
import { UpsertProductBottomSheet } from "@components/upsert-product/upsert-product-bottom-sheet";
import { useEffect } from "react";

const SELL_PRODUCT_BOTTOM_SHEET_QUERY = gql`
  query SellProductBottomSheetQuery {
    getOrCreateDraftProduct {
      id
    }
  }
`;

export const SellProductBottomSheet = () => {
  const { visible, setVisible } = useSellProductContext();

  const [getOrCreateDraft, { data, loading }] =
    useLazyQuery<SellProductBottomSheetQueryQuery>(
      SELL_PRODUCT_BOTTOM_SHEET_QUERY,
      { fetchPolicy: "network-only" },
    );

  useEffect(() => {
    if (visible) {
      getOrCreateDraft();
    }
  }, [visible]);

  if (!data || loading) {
    return null;
  }

  return (
    <UpsertProductBottomSheet
      productId={data.getOrCreateDraftProduct.id}
      mode="create"
      visible={visible}
      onHide={() => {
        setVisible(false);
      }}
    />
  );
};
