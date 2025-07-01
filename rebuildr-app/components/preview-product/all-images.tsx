import { Product } from "@/gql/graphql";
import { Headline } from "@components/typography/text";
import { useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";

type Props = {
  images: Product["images"];
};

export const AllImages = ({ images }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 48) / 3;
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
              aspectRatio: 1,
              width,
              borderRadius: borderRadius.medium,
            }}
          />
        ))}
      </View>
    </View>
  );
};
