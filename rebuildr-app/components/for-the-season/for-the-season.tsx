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

const FOR_THE_SEASON_CATEGORIES = gql`
  query ForTheSeasonCategories($input: CategoriesInput!) {
    categories(input: $input) {
      id
      name
      image {
        id
        url
      }
    }
  }
`;

export const ForTheSeason = () => {
  const { setCategories } = useFilterProduct();

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

  if (!data || data.categories.length < 1) return null;

  return (
    <View style={{ paddingVertical: 16, gap: 16 }}>
      <SectionHeader
        onPress={() => {
          const categoryIds: string[] = [];

          data?.categories.forEach((category) => {
            categoryIds.push(category.id);
          });

          setCategories(categoryIds);
          router.navigate("/(app)/(tabs)/search/products");
        }}
      >
        För säsongen
      </SectionHeader>

      <View style={{ gap: 8, marginHorizontal: -16 }}>
        {[
          data.categories.filter((_, i) => i % 2 === 1), // odd index items
          data.categories.filter((_, i) => i % 2 === 0), // even index items
        ].map((rowItems, rowIndex) => (
          <ScrollView
            key={rowIndex}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", gap: 8 }}
            style={{ paddingHorizontal: 16 }}
          >
            {rowItems.map((category, index) => (
              <ImageQuickLink
                key={index}
                onPress={() => {
                  setCategories([category.id]);
                  router.navigate("/(app)/(tabs)/search/products");
                }}
                source={category.image ? category.image.url : Placeholder.uri}
                label={category.name}
              />
            ))}
          </ScrollView>
        ))}
      </View>
    </View>
  );
};
