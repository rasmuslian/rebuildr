import { gql, useQuery } from "@apollo/client";
import { router } from "expo-router";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import Placeholder from "@assets/images/placeholder.png";
import { SectionHeader } from "@components/sections/section-header";
import {
  ForTheSeasonCategoriesQuery,
  ForTheSeasonCategoriesQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { permanentSection } from "@constants/permanent-sections";
import { buildSeasonLayout, MAX_CHIP_WIDTH } from "./season-layout";

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

export const ForTheSeason = () => {
  const { isDesktop } = useScreenType();
  const [containerWidth, setContainerWidth] = useState(0);

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

  const categories = data?.categories ?? [];
  if (categories.length < 1) return null;

  const { rows, chipSize, gap, widestRowWidth, fitsWithoutScroll } =
    buildSeasonLayout({ categories, containerWidth, isDesktop });

  type categoryType = ForTheSeasonCategoriesQuery["categories"][0];

  const navigateToCategory = (category: categoryType) => {
    router.navigate({
      pathname: "/search/products/[categoryId]",
      params: {
        categoryId: category.id,
      },
    });
  };

  return (
    <View
      style={{ paddingVertical: 16, gap: 16 }}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <SectionHeader
        onPress={() => {
          router.navigate("/search/in-season");
        }}
        buttonTitle={isDesktop ? "Visa alla" : undefined}
      >
        {permanentSection.forTheSeason.title}
      </SectionHeader>
      {fitsWithoutScroll ? (
        <View style={{ gap }}>
          {rows.map((row, index) => (
            <View key={index} style={{ flexDirection: "row", gap }}>
              {row.map((category) => (
                <ImageQuickLink
                  key={category.id}
                  accessibilityRole="link"
                  onPress={() => navigateToCategory(category)}
                  source={category.image ? category.image.url : Placeholder.uri}
                  label={category.name}
                  size={chipSize}
                  style={{ flexGrow: 1, maxWidth: MAX_CHIP_WIDTH }}
                />
              ))}
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -16 }}
          contentContainerStyle={{
            flexDirection: "row",
            paddingHorizontal: 16,
            gap,
            width: widestRowWidth + 80,
            flexWrap: "wrap",
          }}
        >
          {rows.flat().map((category) => (
            <ImageQuickLink
              key={category.id}
              accessibilityRole="link"
              onPress={() => navigateToCategory(category)}
              source={category.image ? category.image.url : Placeholder.uri}
              label={category.name}
              size={chipSize}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
