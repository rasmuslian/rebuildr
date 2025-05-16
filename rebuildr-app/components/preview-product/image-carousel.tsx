import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { View } from "react-native";
import { Product } from "@/gql/graphql";

type Props = {
  images: Product["images"];
};

export const ImageCarousel = ({ images }: Props) => {
  const imageRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <Pressable
        onPress={() => {
          imageRef.current?.present();
        }}
      >
        <Image
          source={images[0].url}
          contentFit="contain"
          style={{ height: 383, borderRadius: borderRadius.medium }}
        />
      </Pressable>
      <BottomSheet
        ref={imageRef}
        name="images"
        title="Alla bilder"
        scrollable
        screenHeight
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
    </>
  );
};
