import { createContext, PropsWithChildren, use, useState } from "react";

export const SellProductContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
} | null>(null);

export const SellProductProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  return (
    <SellProductContext value={{ visible, setVisible: (v) => setVisible(v) }}>
      {children}
    </SellProductContext>
  );
};

export const useSellProductContext = () => {
  const ctx = use(SellProductContext);
  if (!ctx) {
    throw new Error("No sell context");
  }

  return {
    visible: ctx.visible,
    setVisible: ctx.setVisible,
  };
};
