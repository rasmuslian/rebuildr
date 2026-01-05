import { gql, useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import Placeholder from "@assets/images/placeholder.png";
import { SectionHeader } from "@components/sections/section-header";
import {
  ForTheSeasonCategoriesQuery,
  ForTheSeasonCategoriesQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { permanentSection } from "@constants/permanent-sections";
import { useRef } from "react";

const FOR_THE_SEASON_CATEGORIES = gql`
  query ForTheSeasonCategories($input: CategoriesInput!) {
    categories(input: $input) {
      id
      name
      parentId
      image {
        id
        url
      }
    }
  }
`;

const CATEGORY_WIDTH = 225;

export const ForTheSeason = () => {
  const { filterBuilder } = useFilterProduct();
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();
  const layoutRef = useRef<number[]>([]);

  const { data } = useQuery<
    ForTheSeasonCategoriesQuery,
    ForTheSeasonCategoriesQueryVariables
  >(FOR_THE_SEASON_CATEGORIES, {
    variables: {
      input: {
        seasonalCategories: true,
      },
    },
  });

  const screenTypeGap = isDesktop ? 12 : 8;

  const categories = data?.categories ?? [];
  if (categories.length < 1) return null;

  const nrOfCategoriesShown = isDesktop
    ? (screenWidth / CATEGORY_WIDTH) * 2
    : categories.length;

  const sumOfCategoriesWidths = layoutRef.current?.reduce(
    (acc, curr) => acc + curr,
    0,
  );

  type categoryType = ForTheSeasonCategoriesQuery["categories"][0];

  const equallyDividedByWidth = categories.reduce(
    (acc: categoryType[][], curr) => {
      const firstHalf = acc[0].reduce((a, c) => a + c.name.length, 0);
      const secondHalf = acc[1].reduce((a, c) => a + c.name.length, 0);
      if (firstHalf >= secondHalf) {
        return [[...acc[0]], [...acc[1], curr]];
      }
      return [[...acc[0], curr], [...acc[1]]];
    },
    [[], []],
  );
  const sortedByWidth = [
    ...equallyDividedByWidth[0],
    ...equallyDividedByWidth[1],
  ];

  return (
    <View style={{ paddingVertical: 16, gap: 16 }}>
      <SectionHeader
        onPress={() => {
          router.navigate("/search/in-season");
        }}
        buttonTitle={isDesktop ? "Visa alla" : undefined}
      >
        {permanentSection.forTheSeason.title}
      </SectionHeader>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: screenTypeGap,
          width: isDesktop
            ? "100%"
            : (sumOfCategoriesWidths +
                nrOfCategoriesShown * screenTypeGap * 2) /
              2,
          flexWrap: "wrap",
        }}
      >
        {sortedByWidth.slice(0, nrOfCategoriesShown).map((category, index) => (
          <ImageQuickLink
            onLayout={({ nativeEvent: { layout } }) => {
              layoutRef.current[index] = layout.width;
            }}
            key={index}
            onPress={() => {
              filterBuilder
                .setCategories([category])
                .setSelectedCategoryId(category.id)
                .apply();
              router.navigate("/search/products");
            }}
            source={category.image ? category.image.url : Placeholder.uri}
            label={category.name}
          />
        ))}
      </ScrollView>
    </View>
  );
};
