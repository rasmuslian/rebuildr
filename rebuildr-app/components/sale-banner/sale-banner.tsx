import { View, ImageBackground, TouchableOpacity } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Title, Headline, Display } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { LoginModalContext } from "@context/loginModalContext";
import { useContext } from "react";
import { useUser } from "@hooks/useUser";
import { useSellProductContext } from "@context/sell-product-context";
import { useScreenType } from "@hooks/useScreenType";

export function SaleBanner() {
  const colors = useThemeColor();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const { isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();

  const BannerPrompt = isDesktop ? Headline : Title;
  const BannerTitle = isDesktop ? Display : Headline;

  return (
    <TouchableOpacity
      style={{ paddingVertical: 16 }}
      onPress={() => {
        if (isLoggedIn) {
          setSellProductVisible(true);
        } else {
          setLoginVisible(true);
        }
      }}
    >
      <ImageBackground
        source={require("@assets/images/main-background.png")}
        resizeMode="cover"
        style={{
          backgroundColor: colors.logo.vector,
          width: "100%",
          overflow: "hidden",
          borderRadius: borderRadius.medium,
        }}
      >
        <View
          style={{
            paddingVertical: 32,
            paddingHorizontal: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <BannerPrompt
            size={isDesktop ? "medium" : "small"}
            style={{ color: colors.logo.background }}
          >
            kom igång
          </BannerPrompt>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <BannerTitle
              size="medium"
              color="primaryLight"
              style={{ color: colors.logo.background }}
            >
              Sälj något redan idag
            </BannerTitle>
            <Icon icon="chevronRight" customColor={colors.logo.background} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
