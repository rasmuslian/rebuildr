import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  footerBottomMargin?: "small" | "default";
  isStickyFooter?: boolean;
  headerComponent?: React.ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
}

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
  footerStyle,
  footerBottomMargin: _footerBottomMargin = "default",
  isStickyFooter = true,
  headerComponent,
  headerStyle,
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
        <View style={[{ paddingHorizontal: 16 }, headerStyle]}>
          {headerComponent}
        </View>
      )}

      <ScrollView>
        <View
          style={[
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
        </View>
        {footerComponent && !isStickyFooter && <View>{footerComponent}</View>}
      </ScrollView>

      {footerComponent && isStickyFooter && (
        <View
          style={[
            { paddingHorizontal: 16, marginBottom: footerBottomMargin },
            footerStyle,
          ]}
        >
          {footerComponent}
        </View>
      )}
    </View>
  );
};
