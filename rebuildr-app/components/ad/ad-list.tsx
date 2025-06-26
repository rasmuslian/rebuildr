import { ComponentProps } from "react";
import { View } from "react-native";
import { AdDescription } from "./ad-description";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { ProductStatusEnum } from "@/gql/graphql";
import DeletedProduct from "@assets/images/deleted-product.png";
type Props = {
  imageUrl?: string;
  status: ProductStatusEnum;
} & ComponentProps<typeof AdDescription>;

export const AdList = ({ imageUrl, status, ...adDescriptionProps }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <View style={{ flex: 1 }}>
        <AdDescription {...adDescriptionProps} />
      </View>
      <Image
        source={{
          uri:
            status === ProductStatusEnum.Deleted
              ? DeletedProduct.uri
              : imageUrl,
        }}
        style={{
          width: 80,
          height: 80,
          borderRadius: borderRadius.small,
        }}
      />
    </View>
  );
};
