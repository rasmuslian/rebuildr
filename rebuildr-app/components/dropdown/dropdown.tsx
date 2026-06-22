import { useThemeColor } from "@hooks/useThemeColor";
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
};

export const Dropdown = ({ children, position, visible }: DropdownProps) => {
  const colors = useThemeColor();
  const { height } = useWindowDimensions();

  if (!visible) return null;

  const maxHeight = Math.max(240, height - position.y - 16);

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
      <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
};
