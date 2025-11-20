import { useScreenType } from "@hooks/useScreenType";
import {
  createContext,
  PropsWithChildren,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, useWindowDimensions } from "react-native";

export const SlideInSheetContext = createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  setContent: (content: React.ReactNode | null) => void;
} | null>(null);

export const SlideInSheetProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const width = isDesktop ? 500 : screenWidth;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shouldClearRef = useRef(true);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: visible ? 0.3 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (!visible) {
      shouldClearRef.current = true;
      setTimeout(() => {
        // To avoid the content being set to null if new content has been set.
        if (!shouldClearRef.current) return;
        setContent(null);
      }, 300);
    } else {
      shouldClearRef.current = false;
    }
  }, [visible]);

  return (
    <SlideInSheetContext.Provider
      value={{ visible, setVisible: (v) => setVisible(v), setContent }}
    >
      {/** The app itself */}
      {children}

      <Animated.View
        style={[
          {
            position: "absolute",
            overflow: "hidden",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: visible ? "auto" : "none",
          },
          {
            backgroundColor: fadeAnim.interpolate({
              inputRange: [0, 0.5],
              outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            },
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/**Content of a SlideInSheet */}
          {content}
        </Animated.View>
      </Animated.View>
    </SlideInSheetContext.Provider>
  );
};

export const useSlideInSheetContext = () => {
  const ctx = use(SlideInSheetContext);
  if (!ctx) {
    throw new Error("No slideInSheet context");
  }

  return {
    visible: ctx.visible,
    setVisible: ctx.setVisible,
    setContent: ctx.setContent,
  };
};
