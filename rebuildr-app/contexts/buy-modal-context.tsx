import { PaymentDeliveryProps } from "@/app/(app)/buy/[productId]/payment";
import { createContext, PropsWithChildren, use, useState } from "react";

type BuyModalContent = {
  buyState: "summary" | "payment" | "success" | "stripe" | "stripeForm";
  productId?: string;
  purchaseId?: string;
  delivery?: PaymentDeliveryProps;
  stripeClientSecret?: string;
};

export const BuyModalContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  content: BuyModalContent | null;
  setContent: (content: BuyModalContent | null) => void;
} | null>(null);

export const BuyModalProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<BuyModalContent | null>(null);
  return (
    <BuyModalContext.Provider
      value={{ visible, setVisible: (v) => setVisible(v), content, setContent }}
    >
      {children}
    </BuyModalContext.Provider>
  );
};

export const useBuyModalContext = () => {
  const ctx = use(BuyModalContext);
  if (!ctx) {
    throw new Error("No popup context");
  }

  return {
    visible: ctx.visible,
    setVisible: ctx.setVisible,
    content: ctx.content,
    setContent: ctx.setContent,
  };
};
