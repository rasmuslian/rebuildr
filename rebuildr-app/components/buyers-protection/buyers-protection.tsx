import { Title, Body } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { View } from "react-native";
import { Image } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import BuyersProtectionImage from "@assets/svgs/buyers-protection.svg";
import { Check } from "@components/controls/check";

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
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Check
          checkColor="primaryDark"
          selected
          color={primitives.primary200}
        />
        <Body size="medium">Ersättning om varan inte levereras</Body>
      </View>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Check
          checkColor="primaryDark"
          selected
          color={primitives.primary200}
        />
        <Body size="medium">Ersättning om varan inte är som beskriven</Body>
      </View>
      <Body size="small" isLink>
        Läs hur vårt köparskydd fungerar.
      </Body>
    </View>
  );
};
