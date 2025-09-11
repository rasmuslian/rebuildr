import { HandleDraftBottomSheet } from "@components/sell-product/handle-draft-bottom-sheet";
import { createContext, ReactNode, useState } from "react";

export const HandleDraftContext = createContext({
  visible: false,
  setVisible: (visible: boolean) => {},
});

export const HandleDraftProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);

  return (
    <HandleDraftContext.Provider
      value={{
        visible,
        setVisible: (visible: boolean) => setVisible(visible),
      }}
    >
      {children}
      <HandleDraftBottomSheet />
    </HandleDraftContext.Provider>
  );
};
