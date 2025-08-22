import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { router } from "expo-router";
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
