import { View, ImageBackground, TouchableOpacity } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Title, Headline } from "@components/typography/text";
import { router } from "expo-router";
import { Icon } from "@icons/icon";

export function SaleBanner() {
  const colors = useThemeColor();

  return (
    <TouchableOpacity
      style={{ paddingVertical: 16 }}
      onPress={() => {
        router.navigate("/(app)/(tabs)/sell-product");
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
          <Title size="small" style={{ color: colors.logo.background }}>
            kom igång
          </Title>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Headline
              size="medium"
              color="primaryLight"
              style={{ color: colors.logo.background }}
            >
              Sälj något redan idag
            </Headline>
            <Icon icon="chevronRight" customColor={colors.logo.background} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
