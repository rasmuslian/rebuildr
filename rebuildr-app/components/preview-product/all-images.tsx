import { Product } from "@/gql/graphql";
import { Headline } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";

type Props = {
  images: Product["images"];
};

export const AllImages = ({ images }: Props) => {
  return (
    <View>
      <Headline size="small">Alla bilder</Headline>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 16,
        }}
      >
        {images.map((image, i) => (
          <Image
            key={i}
            source={image.url}
            style={{
              minWidth: 110,
              height: 109,
              borderRadius: borderRadius.medium,
            }}
          />
        ))}
      </View>
    </View>
  );
};
