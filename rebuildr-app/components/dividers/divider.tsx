import { ColorTokens } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  style?: ViewStyle;
};

export const Divider = ({ style }: Props) => {
  const colors = useThemeColor();

  const styles = dividerStyles(colors);
  return <View style={[styles.bottomDivider, style]} />;
};

export const dividerStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    bottomDivider: {
      borderBottomWidth: 1,
      borderColor: colors.dividers.neutral,
    },
    topDivider: {
      borderTopWidth: 1,
      borderColor: colors.dividers.neutral,
    },
  });
