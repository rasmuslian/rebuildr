import Footer from "@components/navigation/footer";
import TopBar from "@components/navigation/top-bar/top-bar";
import { primitives } from "@constants/colors";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
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
      <TopBar
        theme="light"
        showSearchBar={false}
        sellButtonLabel="Ny intern annons"
        onSellButtonPress={() =>
          router.navigate({
            pathname: "/internal",
            params: { action: "create", t: Date.now().toString() },
          })
        }
        backgroundColor={primitives.accent100}
        foregroundColor={colors.logo.vector}
        showBottomBorder={false}
        categoriesButtonBackgroundColor={primitives.neutrals100}
      />
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
