import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export const ScreenLayout = ({ children, style }: PageProps) => {
  const colors = useThemeColor();
  return (
    <ScrollView
      contentContainerStyle={[
        {
          flexGrow: 1,
          justifyContent: "space-between",
          backgroundColor: colors.background.neutral,
          marginHorizontal: 16,
        },
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
};
