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
import { Pressable } from "react-native-gesture-handler";

const CATEGORY_FILTER = gql`
  query CategoryFilter($input: GetCategoriesInput!) {
    getCategories(input: $input) {
      id
      name
    }
  }
`;

export const CategoryFilter = () => {
  const { filter, toggleValue, toggleAllCategories, setCategories } =
    useFilterProduct();
  const { data } = useQuery<CategoryFilterQuery, CategoryFilterQueryVariables>(
    CATEGORY_FILTER,
    {
      variables: { input: { parentIds: filter.rootCategoryIds } },
      onCompleted: (data) => {
        if (!filter.rootCategoryIds) {
          return;
        }
        setCategories(
          filter.categoryIds?.filter((id) =>
            data.getCategories.some((category) => category.id === id),
          ) ?? [],
        );
      },
    },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  const selectedCategories = data?.getCategories.filter((category) =>
    filter.categoryIds?.some((id) => id === category.id),
  );

  return (
    <FilterSection
      initialOpen={!filter.rootCategoryIds || !!filter.rootCategoryIds.length}
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
            toggleAllCategories();
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
        {data?.getCategories.map((category, i) => (
          <Pressable
            key={i}
            onPress={() => {
              toggleValue(category.id, "categoryIds");
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
