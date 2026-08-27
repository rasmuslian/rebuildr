import { internalProductFilterVar } from "@/apollo/config";
import { initialFilterProduct } from "@context/filter-product-context";
import { Avatar } from "@components/avatar/avatar";
import { CarouselArrows } from "@components/carousel/carousel-arrows";
import { useCarouselScroll } from "@components/carousel/use-carousel-scroll";
import { Divider } from "@components/dividers/divider";
import { SectionHeader } from "@components/sections/section-header";
import { Label } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";

type Props = {
  categories: {
    category: {
      id: string;
      name: string;
      image?: { url: string } | null;
    };
  }[];
};

export function InternalCategoryGrid({ categories }: Props) {
  const { isDesktop } = useScreenType();
  const { setScrollRef, scrollProps, canScrollLeft, canScrollRight, scrollBy } =
    useCarouselScroll();

  if (!categories.length) return null;

  return (
    <View style={{ marginHorizontal: -16 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <SectionHeader>Kategorier</SectionHeader>
      </View>
      <View>
        <ScrollView
          ref={setScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: isDesktop ? 16 : 8,
          }}
          {...scrollProps}
        >
          {categories.map(({ category }) => (
            <TouchableOpacity
              key={category.id}
              style={{
                width: isDesktop ? 112 : 88,
                alignItems: "center",
                gap: isDesktop ? 12 : 10,
              }}
              onPress={() => {
                internalProductFilterVar({
                  ...initialFilterProduct,
                  rootCategoryIds: [category.id],
                });
                router.navigate("/internal/search");
              }}
            >
              <Avatar
                imageUrl={category.image?.url}
                size={isDesktop ? 96 : 72}
                placeholder="CATEGORY"
              />
              <Label
                size="medium"
                style={{ paddingHorizontal: 2, textAlign: "center" }}
              >
                {category.name}
              </Label>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <CarouselArrows
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onPrev={() => scrollBy(-1)}
          onNext={() => scrollBy(1)}
        />
      </View>
      {isDesktop && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Divider />
        </View>
      )}
    </View>
  );
}
