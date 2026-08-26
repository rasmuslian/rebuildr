import {
  CategoryFilterQuery,
  CategoryFilterQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { FilterSection } from "./filter-section";
import { View } from "react-native";
import { Body } from "@components/typography/text";
import { Check } from "@components/controls/check";
import { FilterCount } from "./filter-count";
import { useProductFacets } from "@hooks/useProductFacets";
import { Pressable } from "react-native-gesture-handler";

const CATEGORY_FILTER = gql`
  query CategoryFilter($input: GetCategoriesInput!) {
    getCategories(input: $input) {
      id
      parentId
      name
    }
  }
`;

export const CategoryFilter = () => {
  const { filter, filterBuilder } = useFilterProduct();
  const facets = useProductFacets();
  const { data } = useQuery<CategoryFilterQuery, CategoryFilterQueryVariables>(
    CATEGORY_FILTER,
    {
      variables: { input: { parentIds: filter.rootCategoryIds } },
    },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  // Inside a project, list only what the project actually holds, and only real
  // subcategories: with no category picked the query also returns the roots,
  // which belong in the section above.
  const categories = data.getCategories.filter(
    (category) =>
      !facets.enabled ||
      (!!category.parentId && facets.categoryCount(category.id) > 0),
  );

  const selectedCategories = categories.filter((category) =>
    filter.categoryIds?.some((id) => id === category.id),
  );

  const allCategoriesSelected = categories.every((c) =>
    selectedCategories.find((selectedCategory) => selectedCategory.id === c.id),
  );

  return (
    <FilterSection
      initialOpen={!!filter.categoryIds && !allCategoriesSelected}
      title="Underkategori"
      collapsedText={
        selectedCategories?.length
          ? `${selectedCategories[0]?.name}` +
            `${selectedCategories[1] ? ", " + selectedCategories[1].name : ""}` +
            `${selectedCategories?.length > 2 ? " +" + (selectedCategories.length - 2) + " till" : ""}`
          : "Alla kategorier"
      }
    >
      <View style={{ gap: 16 }}>
        <Pressable
          key="Alla kategorier"
          onPress={() => {
            filterBuilder.toggleAllCategories().apply();
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body size="medium">Alla underkategorier</Body>
            <Check selected={!filter.categoryIds} />
          </View>
        </Pressable>
        {categories.map((category, i) => (
          <Pressable
            key={i}
            onPress={() => {
              filterBuilder.toggleValue(category.id, "categoryIds").apply();
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Body size="medium">{category.name}</Body>
                <FilterCount
                  count={
                    facets.enabled
                      ? facets.categoryCount(category.id)
                      : undefined
                  }
                />
              </View>
              <Check
                disabled={!filter.categoryIds}
                selected={
                  filter.categoryIds?.some((id) => id === category.id) ||
                  !filter.categoryIds
                }
              />
            </View>
          </Pressable>
        ))}
      </View>
    </FilterSection>
  );
};
