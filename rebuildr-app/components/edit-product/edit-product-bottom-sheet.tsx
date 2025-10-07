import { useEditProductContext } from "@context/edit-product-context";
import { UpsertProductBottomSheet } from "../upsert-product/upsert-product-bottom-sheet";

export const EditProductBottomSheet = () => {
  const { visible, productId, editProduct } = useEditProductContext();

  if (!productId) {
    return null;
  }

  return (
    <UpsertProductBottomSheet
      productId={productId}
      mode="edit"
      visible={visible}
      onHide={() => editProduct(null)}
    />
  );
};
