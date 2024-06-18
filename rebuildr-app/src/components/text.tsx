import { TextProps, Text as RNText, StyleSheet } from "react-native";

export const Text = ({ ...props }: TextProps) => {
  return <RNText {...props} />;
};

export const textStyles = StyleSheet.create({
  title: {
    fontSize: 36,
  },
});
