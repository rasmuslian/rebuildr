import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  footerBottomMargin?: "small" | "default";
  headerComponent?: React.ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  onContentSizeChange?: "scrollToBottom" | "nothing";
}

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
  footerStyle,
  footerBottomMargin: _footerBottomMargin = "default",
  headerComponent,
  headerStyle,
  loading,
  onContentSizeChange = "nothing",
}: PageProps) => {
  const colors = useThemeColor();
  const scrollRef = useRef<ScrollView>(null);

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

      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() => {
          if (onContentSizeChange === "scrollToBottom") {
            scrollRef.current?.scrollToEnd({ animated: false });
          }
        }}
      >
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
      </ScrollView>

      {footerComponent && (
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
