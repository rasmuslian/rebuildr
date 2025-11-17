import { SellProductBottomSheetQueryQuery } from "@/gql/graphql";
import { gql, useLazyQuery } from "@apollo/client";
import { useSellProductContext } from "@context/sell-product-context";
import { UpsertProductBottomSheet } from "@components/upsert-product/upsert-product-bottom-sheet";
import { useEffect } from "react";

export const SELL_PRODUCT_BOTTOM_SHEET_QUERY = gql`
  query SellProductBottomSheetQuery {
    getOrCreateDraftProduct {
      id
    }
    me {
      id
    }
  }
`;

export const SellProductBottomSheet = () => {
  const { visible, setVisible } = useSellProductContext();
  const [getOrCreateDraft, { data }] =
    useLazyQuery<SellProductBottomSheetQueryQuery>(
      SELL_PRODUCT_BOTTOM_SHEET_QUERY,
    );

  useEffect(() => {
    if (visible) {
      getOrCreateDraft();
    }
  }, [visible]);

  if (!data) {
    return null;
  }

  return (
    <UpsertProductBottomSheet
      productId={data.getOrCreateDraftProduct.id}
      mode="create"
      visible={visible}
      onHide={() => setVisible(false)}
    />
  );
};
