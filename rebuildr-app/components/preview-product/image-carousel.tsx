import { useRef, useState } from "react";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import {
  GestureResponderEvent,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();

  const imageWidth = screenWidth - 32;
  const imageHeight = imageWidth;

  const scrollToIndex = (index: number) => {
    setVisibleIndex(index);
    setCurrentIndex(index);

    //Set an animation timeout to "lock" the flatlist while 'scrollToIndex'
    //moves the view to 'index'
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onTouchEnd = () => {
    scrollToIndex(currentIndex);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (animating) return;

    const offset = event.nativeEvent.contentOffset.x;
    const itemWidth = imageWidth + 8;
    const currentPosition = currentIndex * itemWidth;
    const positionDiff = offset - currentPosition;
    const direction = positionDiff < 0 ? "left" : "right";
    const percentObscuredItem = Math.abs(positionDiff) / itemWidth;
    const threshold = 0.2;

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
      <View>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!animating}
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

        <AllImagesBottomSheet
          images={images}
          show={showImagesSheet}
          onDismiss={() => setShowImagesSheet(false)}
        />
      </View>
    </Pressable>
  );
};
