import { ComponentProps } from "react";
import { AdDescription } from "./ad-description";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { ProductStatusEnum } from "@/gql/graphql";
import DeletedProduct from "@assets/images/deleted-product.png";
import { View, StyleSheet } from "react-native";
import { Label } from "@components/typography/text";
type Props = {
  imageUrl?: string;
  status?: ProductStatusEnum;
  imageSize?: "small" | "default";
} & ComponentProps<typeof AdDescription>;

export const AdList = ({
  imageUrl,
  status = ProductStatusEnum.Published,
  imageSize: _imageSize = "default",
  ...adDescriptionProps
}: Props) => {
  const imageSize = _imageSize === "small" ? 64 : 80;
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <View style={{ flex: 1 }}>
        <AdDescription {...adDescriptionProps} />
      </View>
      <View>
        <Image
          source={{
            uri:
              status === ProductStatusEnum.Deleted
                ? DeletedProduct.uri
                : imageUrl,
          }}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: borderRadius.small,
          }}
        />
        {status === ProductStatusEnum.Sold && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#00000080",
              borderRadius: borderRadius.medium,
            }}
          >
            <Label size="large" style={{ color: "white" }}>
              Såld
            </Label>
          </View>
        )}
      </View>
    </View>
  );
};
