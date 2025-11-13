import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import Footer from "@components/navigation/footer";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren, useRef } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  footerBottomMargin?: "small" | "default";
  desktopFooter?: boolean;
  headerComponent?: React.ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  onContentSizeChange?: "scrollToBottom" | "nothing";
  contentHorizontalPadding?: number;
}

export const SCREEN_TOP_MARGIN = 24;
export const SCREEN_BOTTOM_MARGIN = 32;

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
  footerStyle,
  footerBottomMargin: _footerBottomMargin = "default",
  desktopFooter,
  headerComponent,
  headerStyle,
  loading,
  onContentSizeChange = "nothing",
  contentHorizontalPadding,
}: PageProps) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const scrollRef = useRef<ScrollView>(null);
  const paddingHorizontal = contentHorizontalPadding !== undefined
      ? contentHorizontalPadding
      : isDesktop
        ? horizontalPadding.desktop
        : horizontalPadding.mobile;

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
        <View
          style={[
            {
              paddingHorizontal: isDesktop
                ? undefined
                : horizontalPadding.mobile,
            },
            headerStyle,
          ]}
        >
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
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={[
            {
              flexGrow: 1,
              backgroundColor: colors.background.neutral,
              paddingHorizontal,
              marginBottom: SCREEN_BOTTOM_MARGIN,
              marginTop: SCREEN_TOP_MARGIN,
            },
            style,
          ]}
        >
          {loading ? <LoadingSpinner /> : children}
        </View>
        {desktopFooter && isDesktop && <Footer />}
      </ScrollView>

      {footerComponent && (
        <View
          style={[
            { paddingHorizontal, marginBottom: footerBottomMargin },
            footerStyle,
          ]}
        >
          {footerComponent}
        </View>
      )}
    </View>
  );
};
