import Footer from "@components/navigation/footer";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";

type Props = PropsWithChildren<{
  contentMaxWidth?: number;
}>;

export const InternalPageLayout = ({
  children,
  contentMaxWidth = 1440,
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.neutral }}>
      <InternalTopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            width: "100%",
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 75 : 16,
            paddingTop: isDesktop ? 44 : 24,
            paddingBottom: isDesktop ? 64 : 40,
          }}
        >
          {children}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
};
