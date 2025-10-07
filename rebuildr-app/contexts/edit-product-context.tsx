import { createContext, PropsWithChildren, use, useState } from "react";

export const EditProductContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  productId: string | null;
  setProductId: (productId: string | null) => void;
} | null>(null);

export const EditProductProdiver = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  return (
    <EditProductContext
      value={{
        visible,
        setVisible: (v) => setVisible(v),
        productId,
        setProductId,
      }}
    >
      {children}
    </EditProductContext>
  );
};

export const useEditProductContext = () => {
  const ctx = use(EditProductContext);
  if (!ctx) {
    throw new Error("No edit context");
  }
  const editProduct = (productId: string | null) => {
    ctx.setVisible(!!productId);
    ctx.setProductId(productId);
  };

  return {
    visible: ctx.visible,
    setVisible: ctx.setVisible,
    editProduct,
    productId: ctx.productId,
  };
};
