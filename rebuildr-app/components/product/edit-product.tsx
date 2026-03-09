import { UpsertProduct } from "@components/upsert-product/upsert-product";
import { useEditProductContext } from "@context/edit-product-context";

export const EditProduct = () => {
  const { visible, productId, exitEditProduct } = useEditProductContext();

  if (!productId) {
    return null;
  }

  return (
    <UpsertProduct
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
