import { Divider } from "@components/dividers/divider";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useRef } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

type DropdownProps = {
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  position: {
    x: number;
    y: number;
    width: number;
  };
  ignoredPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  showTopDivider?: boolean;
  zIndex?: number;
};

export const Dropdown = ({
  children,
  position,
  ignoredPosition,
  visible,
  onClose,
  showTopDivider = true,
  zIndex = 1000,
}: DropdownProps) => {
  const colors = useThemeColor();
  const { height } = useWindowDimensions();
  const dropdownRef = useRef<View | null>(null);

  useEffect(() => {
    if (!visible || !onClose || typeof document === "undefined") return;

    const handleOutsidePress = (event: MouseEvent) => {
      const dropdownElement = dropdownRef.current as unknown as {
        contains?: (target: EventTarget | null) => boolean;
      } | null;

      if (dropdownElement?.contains?.(event.target)) return;

      const isIgnoredPosition =
        !!ignoredPosition &&
        event.clientX >= ignoredPosition.x &&
        event.clientX <= ignoredPosition.x + ignoredPosition.width &&
        event.clientY >= ignoredPosition.y &&
        event.clientY <= ignoredPosition.y + ignoredPosition.height;

      if (isIgnoredPosition) return;

      onClose();
    };

    document.addEventListener("mousedown", handleOutsidePress);

    return () => {
      document.removeEventListener("mousedown", handleOutsidePress);
    };
  }, [ignoredPosition, onClose, visible]);

  if (!visible) return null;

  const maxHeight = Math.max(240, height - position.y - 16);

  return (
    <View
      ref={dropdownRef}
      style={{
        position: "fixed",
        width: position.width,
        backgroundColor: colors.background.neutral,
        top: position.y,
        left: position.x,
        zIndex,
        elevation: 10,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
      }}
    >
      {showTopDivider && <Divider />}
      <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
};
