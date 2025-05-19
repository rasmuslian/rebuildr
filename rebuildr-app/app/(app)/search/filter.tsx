import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { BrandFilter } from "@components/filter-product/brand-filter";
import { CategoryFilter } from "@components/filter-product/category-filter";
import { ConditionFilter } from "@components/filter-product/condition-filter";
import { PriceFilter } from "@components/filter-product/price-filter";
import { RootCategoryFilter } from "@components/filter-product/root-category-filter";
import { SortingFilter } from "@components/filter-product/sorting-filter";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

export default function Filter() {
  const { reset } = useFilterProduct();
  return (
    <ScreenLayout
      style={{ gap: 12, marginBottom: 32 }}
      headerComponent={
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            <Pressable
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.navigate("/(app)/(tabs)/search/products")
              }
            >
              <Icon icon="arrowLeft" size={18} />
            </Pressable>
            <Title size="medium">Filtrera</Title>
          </View>
          <Divider />
        </View>
      }
      footerComponent={
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 24,
            marginTop: 16,
          }}
        >
          <Button label="Rensa alla" type="tonal" onPress={() => reset()} />
          <Button
            label="Visa resultat"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.navigate("/(app)/(tabs)/search/products")
            }
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <SortingFilter />
      <Divider />
      <RootCategoryFilter />
      <Divider />
      <CategoryFilter />
      <Divider />
      <BrandFilter />
      <Divider />
      <ConditionFilter />
      <Divider />
      <PriceFilter />
    </ScreenLayout>
  );
}
