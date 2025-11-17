import {
  createContext,
  PropsWithChildren,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Easing } from "react-native";

export const PopupContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  content: React.ReactNode | null;
  setContent: (content: React.ReactNode | null) => void;
} | null>(null);

export const PopupProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const isVisible = visible !== false;

  useEffect(() => {
    // Using animated to make sure that map is rendering properly on open
    Animated.timing(contentAnimation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

  return (
    <PopupContext.Provider
      value={{ visible, setVisible: (v) => setVisible(v), content, setContent }}
    >
      {children}

      <Animated.View
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          opacity: contentAnimation,
          pointerEvents: isVisible ? "auto" : "none",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {content}
      </Animated.View>
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
