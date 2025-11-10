import { gql, useQuery } from "@apollo/client";
import { FilterSection } from "./filter-section";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { RootCategoryFilterQuery } from "@/gql/graphql";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Body } from "@components/typography/text";
import { Check } from "@components/controls/check";

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
  const { filter, toggleRootCategory, toggleAllRootCategories } =
    useFilterProduct();
  const { data } = useQuery<RootCategoryFilterQuery>(ROOT_CATEGORY_FILTER);

  const selectedCategories = data?.rootCategories.filter((category) =>
    filter.rootCategoryIds?.some((id) => id === category.id),
  );

  return (
    <FilterSection
      initialOpen={!filter.selectedCategoryId && !!filter.rootCategoryIds}
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
            toggleAllRootCategories();
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
        {data?.rootCategories.map((category, i) => (
          <Pressable
            key={i}
            onPress={() => {
              toggleRootCategory(category);
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Body size="medium">{category.name}</Body>
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
