import { ComponentProps } from "react";
import { View } from "react-native";
import { AdDescription } from "./ad-description";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
type Props = {
  imageUrl?: string;
} & ComponentProps<typeof AdDescription>;

export const AdList = ({ imageUrl, ...adDescriptionProps }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <View style={{ flex: 1 }}>
        <AdDescription {...adDescriptionProps} />
      </View>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: 80,
          height: 80,
          borderRadius: borderRadius.small,
        }}
      />
    </View>
  );
};
