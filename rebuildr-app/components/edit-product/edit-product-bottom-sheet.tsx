import { UpsertProductBottomSheet } from "@components/upsert-product/upsert-product-bottom-sheet";
import { useEditProductContext } from "@context/edit-product-context";

export const EditProductBottomSheet = () => {
  const { visible, productId, exitEditProduct } = useEditProductContext();

  if (!productId) {
    return null;
  }

  return (
    <UpsertProductBottomSheet
      productId={productId}
      mode="edit"
      visible={visible}
      onHide={() => {
        exitEditProduct();
      }}
      onPublished={() => {
        exitEditProduct(true);
      }}
    />
  );
};
