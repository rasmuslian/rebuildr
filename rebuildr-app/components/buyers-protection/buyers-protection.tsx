import { Title, Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { View } from "react-native";
import { Image } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import BuyersProtectionImage from "@assets/svgs/buyers-protection.svg";

export const BuyersProtection = () => {
  const colors = useThemeColor();
  return (
    <View
      style={{
        borderRadius: borderRadius.medium,
        backgroundColor: colors.background.secondary,
        padding: 16,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Title size="medium">
          Vårt köparskydd ingår alltid, utan extra kostnad
        </Title>
        <Image
          source={BuyersProtectionImage.uri}
          style={{ width: 60, height: 60 }}
        />
      </View>
      <Body size="small" isLink>
        Läs hur vårt köparskydd fungerar.
      </Body>
    </View>
  );
};
