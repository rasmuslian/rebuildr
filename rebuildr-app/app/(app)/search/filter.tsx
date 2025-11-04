import { Button } from "@components/buttons/button";
import { FilterProduct } from "@components/filter-product/filter-product";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View } from "react-native";

export default function Filter() {
  const { reset } = useFilterProduct();
  return (
    <ScreenLayout
      style={{ gap: 12, marginBottom: 32 }}
      headerComponent={<Header title="Filtrera" />}
      footerComponent={
        <View
          style={{
            flexDirection: "row",
            gap: 8,
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
      <FilterProduct />
    </ScreenLayout>
  );
}
