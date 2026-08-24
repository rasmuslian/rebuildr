import { useFilterProduct } from "@hooks/useFilterProduct";
import {
  FilterProductScopeProvider,
  isOwnFilterScope,
  useFilterProductScope,
} from "@context/filter-product-scope-context";
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
  const scope = useFilterProductScope();

  // The sheet body is portalled out of this subtree, so the scope has to be
  // handed to it again or the controls would drive the global filter instead.
  const filterProduct = isOwnFilterScope(scope) ? (
    <FilterProductScopeProvider scope={scope}>
      <FilterProduct />
    </FilterProductScopeProvider>
  ) : (
    <FilterProduct />
  );

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
      {filterProduct}
    </BottomSheet>
  );
};
