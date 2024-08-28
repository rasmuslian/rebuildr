import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";

interface SectionProps extends ViewProps {
  fullWidth?: boolean;
}

export const Section = ({ fullWidth, ...props }: SectionProps) => {
  return (
    <View
      style={[
        styles.container,
        fullWidth && { marginHorizontal: 0 },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 80,
    marginBottom: 56,
  },
});
