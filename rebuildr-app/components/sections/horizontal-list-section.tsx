import { useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";

import { CarouselArrows } from "@components/carousel/carousel-arrows";
import { useCarouselScroll } from "@components/carousel/use-carousel-scroll";
import { useScreenType } from "@hooks/useScreenType";
import { SectionHeader } from "./section-header";

type Props<T> = {
  title?: string;
  onPress?: () => void;
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactNode;
  visibleItems: 2 | 3;
  visibleItemsDesktop?: number;
  buttonTitle?: string;
  keyExtractor?: (item: T) => string;
};

const GAP = 16;

export const HoriztalListSection = <T,>({
  title,
  onPress,
  data,
  renderItem,
  visibleItems = 2,
  visibleItemsDesktop = 4,
  buttonTitle,
  keyExtractor,
}: Props<T>) => {
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const [containerWidth, setContainerWidth] = useState(0);
  const { setScrollRef, scrollProps, canScrollLeft, canScrollRight, scrollBy } =
    useCarouselScroll();

  const singleItem = data.length === 1;
  let widthMultiplier = 0.4;
  if (visibleItems === 2) {
    widthMultiplier = 0.75;
  }
  if (singleItem) {
    widthMultiplier = 1;
  }

  const desktopItemWidth =
    containerWidth > 0
      ? (containerWidth - (visibleItemsDesktop - 1) * GAP) / visibleItemsDesktop
      : 0;
  const itemWidth = isDesktop
    ? desktopItemWidth
    : (screenWidth - 32) * widthMultiplier;

  return (
    <View style={{ gap: 16 }}>
      {!!title && (
        <SectionHeader onPress={onPress} buttonTitle={buttonTitle}>
          {title}
        </SectionHeader>
      )}
      <View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      >
        <FlatList
          ref={setScrollRef}
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            gap: GAP,
            marginHorizontal: isDesktop ? 0 : 16,
          }}
          horizontal
          style={{ marginHorizontal: isDesktop ? 0 : -16 }}
          renderItem={({ item }) => (
            <View style={{ width: itemWidth }}>{renderItem({ item })}</View>
          )}
          {...scrollProps}
        />
        <CarouselArrows
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onPrev={() => scrollBy(-1)}
          onNext={() => scrollBy(1)}
        />
      </View>
    </View>
  );
};
