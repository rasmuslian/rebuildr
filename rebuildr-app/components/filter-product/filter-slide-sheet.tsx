import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View } from "react-native";
import { FilterProduct } from "./filter-product";
import { Button } from "@components/buttons/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const FilterSlideSheet = ({ open, onClose }: Props) => {
  const { reset } = useFilterProduct();

  return (
    <SlideInSheet
      title="Filtrera"
      open={open}
      onClose={onClose}
      style={{ gap: 12 }}
      footer={
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
    </SlideInSheet>
  );
};
