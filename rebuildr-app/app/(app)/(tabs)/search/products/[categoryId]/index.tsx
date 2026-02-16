import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SubCategoriesList } from "@components/categories/sub-categories-list/sub-categories-list";
import SearchProducts from "@components/search/search-products";

export default function CategoryPage() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  if (categoryId) {
    return (
      <>
        <SubCategoriesList id={categoryId} />
        <SearchProducts />
      </>
    );
  }

  return <SearchProducts />;
}
