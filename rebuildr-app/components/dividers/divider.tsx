import { ColorTokens } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";
import { StyleSheet, View } from "react-native";

export const Divider = () => {
  const colors = useThemeColor();

  const styles = dividerStyles(colors);
  return <View style={styles.bottomDivider} />;
};

export const dividerStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    bottomDivider: {
      borderBottomWidth: 1,
      borderColor: colors.dividers.neutral,
    },
  });
