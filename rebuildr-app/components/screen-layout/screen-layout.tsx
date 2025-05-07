import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
}

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
}: PageProps) => {
  const colors = useThemeColor();
  return (
    <View
      style={{ flex: 1, justifyContent: "space-between", paddingBottom: 32 }}
    >
      <ScrollView
        contentContainerStyle={[
          {
            flexGrow: 1,
            backgroundColor: colors.background.neutral,
            paddingHorizontal: 16,
          },
          style,
        ]}
      >
        {children}
      </ScrollView>
      <View style={{ paddingHorizontal: 16 }}>{footerComponent}</View>
    </View>
  );
};
