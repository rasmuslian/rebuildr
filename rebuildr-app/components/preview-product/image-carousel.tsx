import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { View } from "react-native";
import { Product } from "@/gql/graphql";
import { primitives } from "@constants/colors";

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
          source={images[0]?.url}
          contentFit="cover"
          style={{ height: 383, borderRadius: borderRadius.medium }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: "40%",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <View
              key={i}
              style={{
                width: i === 4 ? 4 : 8,
                height: i === 4 ? 4 : 8,
                borderRadius: 100,
                backgroundColor: primitives.neutrals100,
                opacity: i === 0 ? 1 : 0.4,
              }}
            />
          ))}
        </View>
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
