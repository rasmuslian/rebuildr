import { useRef, useState } from "react";
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
import { Popup } from "@components/popup/popup";
import { AllImagesPopupContent } from "./all-images-popup-content";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  images: { id?: string; url: string }[];
  status: Product["status"];
  displaySoldOverlay?: boolean;
  width?: number;
  ratio?: number;
  productTitle?: string;
};

export const ImageCarousel = ({
  images,
  status,
  displaySoldOverlay = true,
  width,
  ratio = 1,
  productTitle,
}: Props) => {
  const [showImagesSheet, setShowImagesSheet] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();

  const imageWidth = width ? width : screenWidth - 32;
  const imageHeight = imageWidth / ratio;

  const scrollToIndex = (index: number) => {
    setVisibleIndex(index);
    setCurrentIndex(index);
  };

  const onTouchEnd = () => {
    scrollToIndex(currentIndex);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const itemWidth = imageWidth + 8;
    const currentPosition = currentIndex * itemWidth;
    const positionDiff = offset - currentPosition;
    const direction = positionDiff < 0 ? "left" : "right";
    const percentObscuredItem = Math.abs(positionDiff) / itemWidth;
    const threshold = 0.5;

    if (percentObscuredItem < threshold) return;

    const nextIndex = currentIndex + (direction === "left" ? -1 : 1);
    const clamedIndex = Math.max(Math.min(nextIndex, images.length - 1), 0);

    if (clamedIndex !== currentIndex) {
      scrollToIndex(nextIndex);
    }
  };

  const maxNumberOfIndicators = 5;
  const nrOfIndicators = Math.min(maxNumberOfIndicators, images.length);

  return (
    <Pressable onPress={() => setShowImagesSheet(true)}>
      <View style={{ width: imageWidth }}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(data) => {
            return data.id ? data.id : Math.random().toString();
          }}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: image, index }) => {
            return (
              <View>
                <Image
                  source={image.url}
                  contentFit="cover"
                  alt={
                    productTitle
                      ? `${productTitle} – återbrukat byggmaterial på RebuildR${
                          images.length > 1 ? ` (bild ${index + 1})` : ""
                        }`
                      : undefined
                  }
                  style={{
                    height: imageHeight,
                    borderRadius: borderRadius.medium,
                    aspectRatio: ratio,
                  }}
                />
                {status === ProductStatusEnum.Sold && displaySoldOverlay && (
                  <ProductImageOverlay text="Såld" />
                )}
              </View>
            );
          }}
          pagingEnabled
          decelerationRate="fast"
          onScroll={onScroll}
          onTouchEnd={onTouchEnd}
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

        {isDesktop ? (
          <Popup
            open={showImagesSheet}
            onClose={() => setShowImagesSheet(false)}
            type="full"
          >
            <AllImagesPopupContent images={images} />
          </Popup>
        ) : (
          <AllImagesBottomSheet
            images={images}
            show={showImagesSheet}
            onDismiss={() => setShowImagesSheet(false)}
          />
        )}
      </View>
    </Pressable>
  );
};
