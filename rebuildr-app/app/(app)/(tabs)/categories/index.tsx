import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { RootCategoriesVertical } from "@components/categories/root-categories-vertical";

export default function Categories() {
  return (
    <ScreenLayout
      headerComponent={<Header title="Kategorier" showBackButton={false} />}
    >
      <RootCategoriesVertical />
    </ScreenLayout>
  );
}
