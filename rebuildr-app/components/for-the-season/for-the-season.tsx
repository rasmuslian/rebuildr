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
  const { setSourceSection } = useFilterProduct();
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();

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

  const nrOfCategoriesShown = isDesktop
    ? (screenWidth / CATEGORY_WIDTH) * 2
    : categories.length;

  return (
    <View style={{ paddingVertical: 16, gap: 16 }}>
      <SectionHeader
        onPress={() => {
          setSourceSection({ section: "forTheSeason", data: categories });
          router.navigate("/search/products");
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
          gap: isDesktop ? 12 : 8,
          width: isDesktop ? "100%" : (categories.length / 2) * CATEGORY_WIDTH,
          flexWrap: "wrap",
        }}
      >
        {categories.slice(0, nrOfCategoriesShown).map((category, index) => (
          <ImageQuickLink
            key={index}
            onPress={() => {
              setSourceSection({ section: "forTheSeason", data: [category] });
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
