import { gql, useQuery } from "@apollo/client";
import { FilterSection } from "./filter-section";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { RootCategoryFilterQuery } from "@/gql/graphql";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Body } from "@components/typography/text";
import { Check } from "@components/controls/check";
import { FilterCount } from "./filter-count";
import { useProductFacets } from "@hooks/useProductFacets";

const ROOT_CATEGORY_FILTER = gql`
  query RootCategoryFilter {
    rootCategories {
      id
      name
      children {
        id
      }
    }
  }
`;

export const RootCategoryFilter = () => {
  const { filter, filterBuilder } = useFilterProduct();
  const facets = useProductFacets();
  const { data } = useQuery<RootCategoryFilterQuery>(ROOT_CATEGORY_FILTER);

  // Inside a project, only what the project actually holds is worth listing.
  const categories = data?.rootCategories.filter(
    (category) => !facets.enabled || facets.categoryCount(category.id) > 0,
  );

  const selectedCategories = categories?.filter((category) =>
    filter.rootCategoryIds?.some((id) => id === category.id),
  );

  return (
    <FilterSection
      initialOpen={!!filter.rootCategoryIds?.length}
      title="Kategori"
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
          key="All categories"
          onPress={() => {
            filterBuilder.toggleAllRootCategories().apply();
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body size="medium">Alla Kategorier</Body>
            <Check selected={filter.rootCategoryIds === undefined} />
          </View>
        </Pressable>
        {categories?.map((category, i) => (
          <Pressable
            key={i}
            onPress={() => {
              filterBuilder.toggleRootCategory(category).apply();
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
                disabled={!filter.rootCategoryIds}
                selected={
                  filter.rootCategoryIds?.some((id) => id === category.id) ||
                  !filter.rootCategoryIds
                }
              />
            </View>
          </Pressable>
        ))}
      </View>
    </FilterSection>
  );
};
