import { dividerStyles } from "@components/dividers/divider";
import Footer from "@components/navigation/footer";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import {
  isWeb,
  MAX_CONTENT_WIDTH,
  screenGrowStyle,
  WEB_STICKY,
} from "@constants/layout";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  contentMaxWidth?: number;
  mobileFooterComponent?: ReactNode;
}>;

export const InternalPageLayout = ({
  children,
  contentMaxWidth = MAX_CONTENT_WIDTH,
  mobileFooterComponent,
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={{
        alignSelf: "center",
        flexGrow: 1,
        maxWidth: contentMaxWidth,
        paddingBottom: isDesktop ? 64 : 40,
        paddingHorizontal: isDesktop
          ? horizontalPadding.desktop
          : horizontalPadding.mobile,
        paddingTop: isDesktop ? 44 : 24,
        width: "100%",
      }}
    >
      {children}
    </View>
  );

  const mobileFooter = !isDesktop && mobileFooterComponent && (
    <View
      style={[
        {
          backgroundColor: colors.background.neutral,
          paddingBottom: 16 + insets.bottom,
          paddingHorizontal: horizontalPadding.mobile,
          paddingTop: 8,
          width: "100%",
        },
        dividerStyles(colors).topDivider,
      ]}
    >
      {mobileFooterComponent}
    </View>
  );

  if (isWeb) {
    return (
      <View
        style={[
          screenGrowStyle,
          { backgroundColor: colors.background.neutral },
        ]}
      >
        <InternalTopBar />
        {content}
        {!!mobileFooter && (
          <View style={{ position: WEB_STICKY, bottom: 0, zIndex: 10 }}>
            {mobileFooter}
          </View>
        )}
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.neutral }}>
      <InternalTopBar />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {content}
        <Footer />
      </ScrollView>
      {mobileFooter}
    </View>
  );
};
