import { borderRadius } from "@constants/sizes";
import { primitives } from "@constants/colors";
import { View } from "react-native";
import { Image } from "expo-image";
import { ProductImageOverlay } from "@components/product/product-image-overlay";

type Props = {
  imageUrl?: string;
  sold: boolean;
  position: "left" | "up" | "down" | "full";
  imageAspectRatio?: number;
  alt?: string;
};

export const ImageCardPart = ({
  imageUrl,
  position,
  sold,
  imageAspectRatio = 1,
  alt,
}: Props) => {
  let borderStyle = {};
  if (position === "down") {
    borderStyle = { borderBottomRightRadius: borderRadius.medium };
  }
  if (position === "up") {
    borderStyle = { borderTopRightRadius: borderRadius.medium };
  }
  if (position === "left") {
    borderStyle = {
      borderTopLeftRadius: borderRadius.medium,
      borderBottomLeftRadius: borderRadius.medium,
    };
  }
  if (position === "full") {
    borderStyle = {
      borderRadius: borderRadius.medium,
    };
  }
  return (
    <View
      style={{
        flex: position === "left" ? 2 : 1,
        ...borderStyle,
      }}
    >
      {imageUrl ? (
        <Image
          source={{
            uri: imageUrl,
          }}
          alt={alt}
          style={{
            aspectRatio: imageAspectRatio,
            flexGrow: 1,
            ...borderStyle,
          }}
        />
      ) : (
        <View
          style={{
            aspectRatio: imageAspectRatio,
            height: "100%",
            backgroundColor: primitives.neutrals200,
            ...borderStyle,
          }}
        />
      )}
      {sold && <ProductImageOverlay text="Såld" style={borderStyle} />}
    </View>
  );
};
