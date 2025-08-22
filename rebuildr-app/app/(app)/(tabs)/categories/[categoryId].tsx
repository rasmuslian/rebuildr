import React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { SubCategoriesVertical } from "@components/categories/sub-categories-vertical";

export default function Category() {
  const { categoryId, name } = useLocalSearchParams<{
    categoryId: string;
    name: string;
  }>();

  return (
    <ScreenLayout
      headerComponent={
        <Header
          title={name}
          ctas={[
            {
              icon: "X",
              onPress: () => {
                router.canGoBack() ? router.back() : router.navigate("/");
              },
            },
          ]}
        />
      }
    >
      <SubCategoriesVertical id={categoryId} />
    </ScreenLayout>
  );
}
