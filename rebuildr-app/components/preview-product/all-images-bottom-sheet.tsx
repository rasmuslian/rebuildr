import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { View, Image, Dimensions } from "react-native";
import { borderRadius } from "@constants/sizes";
import { useEffect, useState } from "react";

const screenWidth = Dimensions.get("window").width - 48;
type Props = {
  images: { url: string }[];
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
      <View
        style={{
          gap: 16,
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {images.map((image, i) => (
          <DynamicImage uri={image.url} key={i} />
        ))}
      </View>
    </BottomSheet>
  );
};

const DynamicImage = ({ uri }: { uri: string }) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    Image.getSize(uri, (w, h) => {
      setAspectRatio(w / h);
    });
  }, [uri]);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        borderRadius: borderRadius.medium,
      }}
    >
      <Image
        source={{ uri }}
        style={{
          width: screenWidth,
          height: undefined,
          aspectRatio,
          borderRadius: borderRadius.medium,
        }}
        resizeMode="contain"
      />
    </View>
  );
};
