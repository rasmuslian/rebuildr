import { createContext, PropsWithChildren, use, useState } from "react";

export const EditProductContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  productId: string | null;
  setProductId: (productId: string | null) => void;
  setOnEditCompleted: (callback: (() => void) | null) => void;
  onEditCompleted?: () => void;
} | null>(null);

export const EditProductProdiver = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [onEditCompleted, _setOnEditCompleted] = useState<
    () => (() => void) | null
  >(() => null);

  const setOnEditCompleted = (callback: (() => void) | null) => {
    _setOnEditCompleted(() => callback);
  };
  return (
    <EditProductContext
      value={{
        visible,
        setVisible: (v) => setVisible(v),
        productId,
        setProductId,
        setOnEditCompleted,
        onEditCompleted,
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
  const editProduct = (productId: string, onEditCompleted?: () => void) => {
    ctx.setVisible(true);
    ctx.setProductId(productId);
    if (onEditCompleted) {
      ctx.setOnEditCompleted(onEditCompleted);
    }
  };

  const exitEditProduct = (editCompleted?: boolean) => {
    ctx.setVisible(false);
    ctx.setProductId(null);
    ctx.setOnEditCompleted(null);
    if (editCompleted) {
      ctx.onEditCompleted?.();
    }
  };

  return {
    visible: ctx.visible,
    setVisible: ctx.setVisible,
    editProduct,
    productId: ctx.productId,
    exitEditProduct,
  };
};
