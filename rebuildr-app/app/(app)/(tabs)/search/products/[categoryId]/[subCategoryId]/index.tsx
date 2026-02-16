import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SubCategoriesList } from "@components/categories/sub-categories-list/sub-categories-list";
import SearchProducts from "@components/search/search-products";

export default function SubCategoryPage() {
  const { subCategoryId } = useLocalSearchParams<{ subCategoryId?: string }>();

  if (subCategoryId) {
    return (
      <>
        <SubCategoriesList id={subCategoryId} />
        <SearchProducts />
      </>
    );
  }

  return <SearchProducts />;
}
