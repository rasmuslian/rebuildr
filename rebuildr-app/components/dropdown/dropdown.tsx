import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type DropdownProps = {
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  position: {
    x: number;
    y: number;
    width: number;
  };
};

export const Dropdown = ({ children, position, visible }: DropdownProps) => {
  const colors = useThemeColor();
  if (!visible) return null;
  return (
    <View
      style={{
        position: "fixed",
        width: position.width,
        backgroundColor: colors.background.neutral,
        top: position.y,
        left: position.x,
        zIndex: 1000, // FIXME: Do we need this high?
        elevation: 10,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
      }}
    >
      {children}
    </View>
  );
};
