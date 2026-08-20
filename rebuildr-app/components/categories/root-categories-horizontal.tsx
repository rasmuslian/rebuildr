import React from "react";
import { router } from "expo-router";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@apollo/client";
import { Headline, Label } from "@components/typography/text";
import { ROOT_CATEGORIES } from "@/queries";
import { Avatar } from "@components/avatar/avatar";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { Divider } from "@components/dividers/divider";
import { CarouselArrows } from "@components/carousel/carousel-arrows";
import { useCarouselScroll } from "@components/carousel/use-carousel-scroll";

export function RootCategoriesHorizontal() {
  const { isDesktop } = useScreenType();
  const { setScrollRef, scrollProps, canScrollLeft, canScrollRight, scrollBy } =
    useCarouselScroll();

  const { data } = useQuery<RootCategoriesQuery, RootCategoriesQueryVariables>(
    ROOT_CATEGORIES,
    {
      variables: {
        input: {
          orderBy: OrderCategoriesEnum.OrderIndexAsc,
        },
      },
    },
  );

  const categories = data?.rootCategories ?? [];

  return (
    <View
      style={{
        marginHorizontal: -16,
      }}
    >
      {isDesktop && (
        <View style={{ paddingHorizontal: 16 }}>
          <Headline size="small" style={{ marginBottom: 20 }}>
            Populära Kategorier
          </Headline>
        </View>
      )}
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
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={{
                width: isDesktop ? 100 : 80,
                alignItems: "center",
                gap: isDesktop ? 14 : 12,
              }}
              onPress={() => {
                router.navigate({
                  pathname: "/search/products/[categoryId]",
                  params: {
                    categoryId: c.id,
                  },
                });
              }}
            >
              <Avatar
                imageUrl={c.image?.url}
                size={isDesktop ? 88 : 60}
                placeholder="CATEGORY"
              />
              <Label
                size="medium"
                style={{
                  paddingHorizontal: 2,
                  textAlign: "center",
                }}
              >
                {c.name}
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
