import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { View } from "react-native";
import { Image } from "expo-image";
import { File } from "@/gql/graphql";
import { borderRadius } from "@constants/sizes";

type Props = {
  images: File[];
  show: boolean;
  onDismiss: () => void;
};

export const AllImagesBottomSheet = ({ images, show, onDismiss }: Props) => {
  return (
    <BottomSheet
      open={show}
      name="images"
      title="Alla bilder"
      scrollable
      screenHeight
      onDismiss={() => onDismiss()}
    >
      <View style={{ gap: 16, flex: 1, height: "100%" }}>
        {images.map((image, i) => (
          <Image
            key={i}
            source={image.url}
            style={{
              minHeight: 230,
              aspectRatio: 1,
              borderRadius: borderRadius.medium,
            }}
            contentFit="contain"
          />
        ))}
      </View>
    </BottomSheet>
  );
};
