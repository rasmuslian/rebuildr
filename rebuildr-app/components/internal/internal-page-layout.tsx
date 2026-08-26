import Footer from "@components/navigation/footer";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { isWeb, MAX_CONTENT_WIDTH, screenGrowStyle } from "@constants/layout";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";

type Props = PropsWithChildren<{
  contentMaxWidth?: number;
}>;

export const InternalPageLayout = ({
  children,
  contentMaxWidth = MAX_CONTENT_WIDTH,
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

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
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.neutral }}>
      <InternalTopBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {content}
        <Footer />
      </ScrollView>
    </View>
  );
};
