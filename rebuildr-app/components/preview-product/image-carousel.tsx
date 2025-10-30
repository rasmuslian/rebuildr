import { useState } from "react";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { Product, ProductStatusEnum } from "@/gql/graphql";
import { primitives } from "@constants/colors";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { AllImagesBottomSheet } from "./all-images-bottom-sheet";

type Props = {
  images: { url: string }[];
  status: Product["status"];
  displaySoldOverlay?: boolean;
};

export const ImageCarousel = ({
  images,
  status,
  displaySoldOverlay = true,
}: Props) => {
  const [showImagesSheet, setShowImagesSheet] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const [visibleIndex, setVisibleIndex] = useState(0);
  const imageWidth = screenWidth - 32;
  const imageHeight = imageWidth;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / (imageWidth + 8));
    setVisibleIndex(index);
  };

  const maxNumberOfIndicators = 5;
  const nrOfIndicators = Math.min(maxNumberOfIndicators, images.length);

  return (
    <Pressable onPress={() => setShowImagesSheet(true)}>
      <View>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: image }) => {
            return (
              <View>
                <Image
                  source={image.url}
                  contentFit="cover"
                  style={{
                    height: imageHeight,
                    borderRadius: borderRadius.medium,
                    aspectRatio: 1,
                  }}
                />
                {status === ProductStatusEnum.Sold && displaySoldOverlay && (
                  <ProductImageOverlay text="Såld" />
                )}
              </View>
            );
          }}
          onScroll={onScroll}
        />
        {nrOfIndicators > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {Array.from({ length: nrOfIndicators }, (_, i) => {
              const isFirstOne = i === 0;
              const isLastOne = i === nrOfIndicators - 1 && !isFirstOne;
              const isCurrent = i === visibleIndex;

              //the selected image is the last one, 5 or higher
              const indexIsAtEnd = visibleIndex >= i && isLastOne;

              let isSmall = false;
              let isHighlighted = false;
              if (isCurrent || indexIsAtEnd) {
                isHighlighted = true;
              }

              const moreImagesExist = images.length > nrOfIndicators;
              if (moreImagesExist) {
                if (isLastOne && visibleIndex < maxNumberOfIndicators) {
                  isSmall = true;
                }
                if (isFirstOne && visibleIndex >= maxNumberOfIndicators) {
                  isSmall = true;
                }
              }

              return (
                <View
                  key={i}
                  style={{
                    width: isSmall ? 4 : 8,
                    height: isSmall ? 4 : 8,
                    borderRadius: 100,
                    backgroundColor: primitives.neutrals100,
                    opacity: isHighlighted ? 1 : 0.4,
                  }}
                />
              );
            })}
          </View>
        )}

        <AllImagesBottomSheet
          images={images}
          show={showImagesSheet}
          onDismiss={() => setShowImagesSheet(false)}
        />
      </View>
    </Pressable>
  );
};
