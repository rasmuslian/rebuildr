import { createContext, PropsWithChildren, use, useState } from "react";

type PopupVisible = "full" | "partial" | false;

export const PopupContext = createContext<{
  visible: PopupVisible;
  setVisible: (v: PopupVisible) => void;
  content: React.ReactNode | null;
  setContent: (content: React.ReactNode | null) => void;
} | null>(null);

export const PopupProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState<PopupVisible>(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  return (
    <PopupContext.Provider
      value={{ visible, setVisible: (v) => setVisible(v), content, setContent }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopupContext = () => {
  const ctx = use(PopupContext);
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
