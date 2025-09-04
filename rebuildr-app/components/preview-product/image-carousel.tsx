import { useState } from "react";
import { Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { View } from "react-native";
import { Product, ProductStatusEnum } from "@/gql/graphql";
import { primitives } from "@constants/colors";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { AllImagesBottomSheet } from "./all-images-bottom-sheet";

type Props = {
  images: Product["images"];
  status: Product["status"];
};

export const ImageCarousel = ({ images, status }: Props) => {
  const [showImagesSheet, setShowImagesSheet] = useState(false);

  const nrOfIndicators = Math.min(5, images.length);

  return (
    <>
      <Pressable onPress={() => setShowImagesSheet(true)}>
        <Image
          source={images[0]?.url}
          contentFit="cover"
          style={{ height: 383, borderRadius: borderRadius.medium }}
        />
        {status === ProductStatusEnum.Sold && (
          <ProductImageOverlay text="Såld" />
        )}
        {nrOfIndicators > 1 && (
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
            {Array.from({ length: nrOfIndicators }, (_, i) => {
              const isFirstOne = i === 0;
              const isLastOne = i === nrOfIndicators - 1 && !isFirstOne;
              return (
                <View
                  key={i}
                  style={{
                    width: isLastOne ? 4 : 8,
                    height: isLastOne ? 4 : 8,
                    borderRadius: 100,
                    backgroundColor: primitives.neutrals100,
                    opacity: isFirstOne ? 1 : 0.4,
                  }}
                />
              );
            })}
          </View>
        )}
      </Pressable>
      <AllImagesBottomSheet
        images={images}
        show={showImagesSheet}
        onDismiss={() => setShowImagesSheet(false)}
      />
    </>
  );
};
