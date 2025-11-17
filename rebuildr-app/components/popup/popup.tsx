import { Button } from "@components/buttons/button";
import { primitives } from "@constants/colors";
import { usePopupContext } from "@context/popup-context";
import { PropsWithChildren, useEffect } from "react";
import { Pressable, View } from "react-native";

type Props = {
  open: boolean;
  onClose?: () => void;
  type?: "full" | "partial";
} & PropsWithChildren;

export const Popup = ({ open, onClose, type, children }: Props) => {
  const { setVisible, setContent } = usePopupContext();
  const isFull = type === "full";

  const handleClose = () => {
    onClose?.();
  };

  const content = (
    <>
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
          width: isFull ? "100%" : "50%",
          height: isFull ? "100%" : "auto",
          backgroundColor: primitives.neutrals100,
          borderRadius: !isFull ? 12 : 0,
        }}
      >
        {children}
      </View>
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
    </>
  );

  useEffect(() => {
    setVisible(open);
    if (open) {
      setContent(content);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setContent(content);
    }
  }, [children]);

  return null;
};
