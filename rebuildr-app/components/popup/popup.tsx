import { Button } from "@components/buttons/button";
import { primitives } from "@constants/colors";
import { Portal } from "@gorhom/portal";
import {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useBodyScrollLock } from "@hooks/useBodyScrollLock";

type Props = {
  open: boolean;
  onClose?: () => void;
  type?: "full" | "partial";
  footer?: ReactElement;
} & PropsWithChildren;

export const Popup = ({ open, onClose, type, children, footer }: Props) => {
  const isFull = type === "full";
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const key = useMemo(() => `popup-${Math.random().toString(8)}`, []);

  useBodyScrollLock(open);

  const handleClose = () => {
    onClose?.();
  };

  useEffect(() => {
    Animated.timing(contentAnimation, {
      toValue: open ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [open]);

  return (
    <Portal key={key} hostName="OverlayProvider">
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
          pointerEvents: open ? "auto" : "none",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!isFull && (
          <Pressable
            onPress={handleClose}
            style={{
              position: "absolute",
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          />
        )}
        <View
          style={{
            flex: isFull ? 1 : undefined,
            width: isFull ? "100%" : 620,
            height: isFull ? "100%" : "auto",
            backgroundColor: primitives.neutrals100,
            borderRadius: !isFull ? 28 : 0,
          }}
        >
          {children}
          {footer && footer}
        </View>
        {isFull && (
          <View style={{ position: "absolute", top: 24, right: 18 }}>
            <Button
              label="Stäng"
              onPress={handleClose}
              icon="X"
              iconPosition="right"
              type="filled"
              theme="dark"
              showShadow
            />
          </View>
        )}
      </Animated.View>
    </Portal>
  );
};
