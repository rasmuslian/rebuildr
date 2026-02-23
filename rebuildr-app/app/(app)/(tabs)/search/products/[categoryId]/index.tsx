import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { SubCategoriesList } from "@components/categories/sub-categories-list";
import SearchProducts from "@components/search/search-products";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";

export default function CategoryPage() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { filterBuilder } = useFilterProduct();

  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        input: { id: categoryId },
      },
    },
  );

  useEffect(() => {
    if (data) {
      filterBuilder
        .setCategories([...data.category.children, data.category])
        .apply();
    }
  }, [data]);

  return (
    <>
      {data && <SubCategoriesList category={data.category} />}
      <SearchProducts />
    </>
  );
}
