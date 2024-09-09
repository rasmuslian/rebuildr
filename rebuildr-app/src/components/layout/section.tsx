import React from "react";
import { View, ViewProps } from "react-native";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

interface SectionProps extends ViewProps {
  fullWidth?: boolean;
}

export const Section = ({ fullWidth, ...props }: SectionProps) => {
  const styles = useResponsiveStyles(responsiveStyles);
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

const responsiveStyles = {
  container: {
    marginHorizontal: 80,
    marginBottom: 56,
    small: {
      marginHorizontal: 40,
    },
  },
} as const;
