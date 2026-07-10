import { dividerStyles } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import Footer from "@components/navigation/footer";
import { horizontalPadding } from "@constants/sizes";
import { isWeb, screenGrowStyle, WEB_STICKY } from "@constants/layout";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { PropsWithChildren, useRef, useState } from "react";
import {
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PageProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  footerBottomMargin?: "small" | "default";
  footerBorder?: boolean;
  desktopFooter?: boolean;
  headerComponent?: React.ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  onContentSizeChange?: "scrollToBottom" | "nothing";
  contentHorizontalPadding?: number;
  // Web only. "document" (default) scrolls the page so the browser chrome
  // collapses; "contained" keeps a fixed-height inner scroll (chat/maps).
  scrollMode?: "document" | "contained";
}

export const SCREEN_TOP_MARGIN = 24;
export const SCREEN_BOTTOM_MARGIN = 32;
export const SCREEN_HORIZONTAL_MARGIN_DESKTOP = 75;
export const SCREEN_HORIZONTAL_MARGIN_MOBILE = 16;

export const ScreenLayout = ({
  children,
  style,
  footerComponent,
  footerStyle,
  footerBottomMargin: _footerBottomMargin = "default",
  footerBorder,
  desktopFooter,
  headerComponent,
  headerStyle,
  loading,
  onContentSizeChange = "nothing",
  contentHorizontalPadding,
  scrollMode = "document",
}: PageProps) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const windowHeight = useWindowDimensions().height;
  const [footerHeight, setFooterHeight] = useState(0);

  const paddingHorizontal =
    contentHorizontalPadding !== undefined
      ? contentHorizontalPadding
      : isDesktop
        ? horizontalPadding.desktop
        : horizontalPadding.mobile;

  const footerBottomMargin = _footerBottomMargin === "default" ? 32 : 16;

  // Chat-style screens must keep an inner scroll area so they can scroll to the
  // bottom; everything else scrolls the document on web.
  const effectiveMode =
    onContentSizeChange === "scrollToBottom" ? "contained" : scrollMode;
  const documentScroll = isWeb && effectiveMode === "document";

  if (documentScroll) {
    return (
      <View
        style={[
          screenGrowStyle,
          { backgroundColor: colors.background.neutral },
        ]}
      >
        {headerComponent && (
          <View
            style={[
              {
                position: WEB_STICKY,
                top: 0,
                zIndex: 20,
                backgroundColor: colors.background.neutral,
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

        <View
          style={[
            {
              flexGrow: 1,
              backgroundColor: colors.background.neutral,
              paddingHorizontal,
              marginTop: SCREEN_TOP_MARGIN,
              marginBottom: SCREEN_BOTTOM_MARGIN,
              paddingBottom: footerHeight,
            },
            style,
          ]}
        >
          {loading ? <LoadingSpinner /> : children}
        </View>

        {desktopFooter && isDesktop && <Footer />}

        {footerComponent && (
          <View
            onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
            style={[
              {
                position: WEB_STICKY,
                bottom: 0,
                zIndex: 10,
                backgroundColor: colors.background.neutral,
                paddingHorizontal,
                paddingTop: 8,
                paddingBottom: footerBottomMargin + insets.bottom,
              },
              footerBorder && dividerStyles(colors).topDivider,
              footerStyle,
            ]}
          >
            {footerComponent}
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        // Native: fill the screen. Contained web: pin to the viewport so the
        // inner ScrollView (not the document) scrolls.
        ...(isWeb ? { height: windowHeight } : { flex: 1 }),
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
        showsVerticalScrollIndicator={false}
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
            footerBorder && dividerStyles(colors).topDivider,
            footerStyle,
          ]}
        >
          {footerComponent}
        </View>
      )}
    </View>
  );
};
