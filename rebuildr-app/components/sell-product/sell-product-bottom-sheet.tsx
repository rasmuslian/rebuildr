import { SellProductBottomSheetQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { useSellProductContext } from "@context/sell-product-context";
import { UpsertProductBottomSheet } from "@components/upsert-product/upsert-product-bottom-sheet";

export const SELL_PRODUCT_BOTTOM_SHEET_QUERY = gql`
  query SellProductBottomSheetQuery {
    getOrCreateDraftProduct {
      id
    }
    me {
      id
      selectedPayoutMethod
    }
  }
`;

export const SellProductBottomSheet = () => {
  const { visible, setVisible } = useSellProductContext();
  const { data } = useQuery<SellProductBottomSheetQueryQuery>(
    SELL_PRODUCT_BOTTOM_SHEET_QUERY,
  );

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
