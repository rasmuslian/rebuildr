import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { File } from "@/gql/graphql";

type Props = {
  images: File[];
  show: boolean;
  onDismiss: () => void;
};

export const AllImagesBottomSheet = ({ images, show, onDismiss }: Props) => {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (show) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  return (
    <BottomSheet
      ref={ref}
      name="images"
      title="Alla bilder"
      scrollable
      screenHeight
      onDismiss={() => onDismiss()}
    >
      <View style={{ gap: 16, marginTop: 16, flex: 1, height: "100%" }}>
        {images.map((image, i) => (
          <Image
            key={i}
            source={image.url}
            style={{ minHeight: 230 }}
            contentFit="contain"
          />
        ))}
      </View>
    </BottomSheet>
  );
};
