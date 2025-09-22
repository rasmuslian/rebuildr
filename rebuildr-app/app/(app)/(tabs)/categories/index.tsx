import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { RootCategoriesVertical } from "@components/categories/root-categories-vertical";
import { router } from "expo-router";

export default function Categories() {
  return (
    <ScreenLayout
      headerComponent={<Header title="Kategorier" showBackButton={false} />}
    >
      <RootCategoriesVertical
        onExpandCategory={(category) =>
          router.navigate({
            pathname: "/categories/[categoryId]",
            params: { categoryId: category.id, name: category.name },
          })
        }
      />
    </ScreenLayout>
  );
}
