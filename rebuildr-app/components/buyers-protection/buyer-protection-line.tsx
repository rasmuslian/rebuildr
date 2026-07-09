import { Body } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import BuyersProtectionImage from "@assets/svgs/buyers-protection.svg";

export const BuyerProtectionLine = () => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image
        source={BuyersProtectionImage.uri}
        style={{ width: 20, height: 20 }}
      />
      <Body
        size="small"
        color="secondary"
        style={{ flex: 1 }}
        link={{ pathname: "/article/[slug]", params: { slug: "saekerhet" } }}
      >
        Köparskydd ingår · Pengarna hålls tills du bekräftat mottagandet
      </Body>
    </View>
  );
};
