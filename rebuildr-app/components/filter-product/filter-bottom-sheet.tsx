import { useFilterProduct } from "@hooks/useFilterProduct";
import { View } from "react-native";
import { FilterProduct } from "./filter-product";
import { Button } from "@components/buttons/button";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const FilterBottomSheet = ({ open, onClose }: Props) => {
  const { filterBuilder } = useFilterProduct();

  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      name="filterBottomSheet"
      title="Sortera & Filtrera"
      scrollable
      containerStyle={{ gap: 12, marginBottom: 32 }}
      footer={
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            label="Rensa alla"
            type="tonal"
            onPress={() => filterBuilder.reset().apply()}
          />
          <Button label="Visa resultat" onPress={onClose} style={{ flex: 1 }} />
        </View>
      }
    >
      <FilterProduct />
    </BottomSheet>
  );
};
