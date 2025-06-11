import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  footerBottomMargin?: "small" | "default";
  headerComponent?: React.ReactNode;
  loading?: boolean;
}

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
  footerBottomMargin: _footerBottomMargin = "default",
  headerComponent,
  loading,
}: PageProps) => {
  const colors = useThemeColor();

  const footerBottomMargin = _footerBottomMargin === "default" ? 32 : 16;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        backgroundColor: colors.background.neutral,
      }}
    >
      {headerComponent && (
        <View style={{ paddingHorizontal: 16 }}>{headerComponent}</View>
      )}
      <ScrollView
        contentContainerStyle={[
          {
            flexGrow: 1,
            backgroundColor: colors.background.neutral,
            paddingHorizontal: 16,
            marginBottom: 32,
            marginTop: 24,
          },
          style,
        ]}
      >
        {loading ? <LoadingSpinner /> : children}
      </ScrollView>
      {footerComponent && (
        <View
          style={{ paddingHorizontal: 16, marginBottom: footerBottomMargin }}
        >
          {footerComponent}
        </View>
      )}
    </View>
  );
};
