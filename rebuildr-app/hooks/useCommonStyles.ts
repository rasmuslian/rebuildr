import { ViewStyle } from "react-native";
import { useThemeColor } from "./useThemeColor";

export const useCommonStyles = () => {
  const colors = useThemeColor();

  const bottomDividerStyle: ViewStyle = {
    borderBottomWidth: 1,
    borderColor: colors.dividers.neutral,
  };

  return {
    bottomDividerStyle,
  };
};
