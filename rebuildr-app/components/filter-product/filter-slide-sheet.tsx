import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { useFilterProduct } from "@hooks/useFilterProduct";
import {
  FilterProductScopeProvider,
  isOwnFilterScope,
  useFilterProductScope,
} from "@context/filter-product-scope-context";
import { View } from "react-native";
import { FilterProduct } from "./filter-product";
import { Button } from "@components/buttons/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const FilterSlideSheet = ({ open, onClose }: Props) => {
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
    <SlideInSheet
      title="Sortera & Filtrera"
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
    </SlideInSheet>
  );
};
