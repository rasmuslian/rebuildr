import { gql, useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View, ScrollView } from "react-native";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import Placeholder from "@assets/images/placeholder.png";
import { SectionHeader } from "@components/sections/section-header";
import {
  ForTheSeasonCategoriesQuery,
  ForTheSeasonCategoriesQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";

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
  const { setCategories } = useFilterProduct();
  const { isDesktop } = useScreenType();

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

  return (
    <View style={{ paddingVertical: 16, gap: 16 }}>
      <SectionHeader
        onPress={() => {
          setCategories({
            categories,
          });
          router.navigate("/(app)/(tabs)/search/products");
        }}
        buttonTitle={isDesktop ? "Visa alla" : undefined}
      >
        För säsongen
      </SectionHeader>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: isDesktop ? 12 : 8,
          width: isDesktop ? "100%" : (categories.length / 2) * 200,
          flexWrap: "wrap",
        }}
      >
        {categories.map((category, index) => (
          <ImageQuickLink
            key={index}
            onPress={() => {
              setCategories({
                categories: [category],
                selectedCategoryId: category.id,
              });
              router.navigate("/(app)/(tabs)/search/products");
            }}
            source={category.image ? category.image.url : Placeholder.uri}
            label={category.name}
          />
        ))}
      </ScrollView>
    </View>
  );
};
