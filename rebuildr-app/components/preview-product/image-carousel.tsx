import { useRef, useState } from "react";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { View, ViewToken } from "react-native";
import { File, Product, ProductStatusEnum } from "@/gql/graphql";
import { primitives } from "@constants/colors";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { AllImagesBottomSheet } from "./all-images-bottom-sheet";

type Props = {
  images: Product["images"];
  status: Product["status"];
  displaySoldOverlay?: boolean;
};

export const ImageCarousel = ({
  images,
  status,
  displaySoldOverlay = true,
}: Props) => {
  const [showImagesSheet, setShowImagesSheet] = useState(false);

  const [visibleIndex, setVisibleIndex] = useState(0);

  // Must be a ref or else Flatlist throws error
  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<File>[] }) => {
      if (viewableItems[0].index !== null) {
        setVisibleIndex(viewableItems[0].index);
      }
    },
  );

  // How much of the item must be visible
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const maxNumberOfIndicators = 5;
  const nrOfIndicators = Math.min(maxNumberOfIndicators, images.length);

  return (
    <Pressable onPress={() => setShowImagesSheet(true)}>
      <View>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(image) => image.id}
          renderItem={({ item: image, separators }) => {
            return (
              <View>
                <Image
                  source={image.url}
                  contentFit="cover"
                  style={{
                    height: 363,
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
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
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
