import { useFilterProduct } from "@hooks/useFilterProduct";
import { FilterSection } from "./filter-section";
import { orderProducts } from "@constants/order-products";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Body } from "@components/typography/text";
import { OrderProductsEnum } from "@/gql/graphql";
import { Radio } from "@components/controls/radio";

export const SortingFilter = () => {
  const { filter, setSorting } = useFilterProduct();
  return (
    <FilterSection
      title="Sortering"
      collapsedText={orderProducts[filter.sorting].text}
      initialOpen
    >
      <View style={{ gap: 16 }}>
        {Object.keys(orderProducts).map((orderKey, i) => (
          <Pressable
            key={i}
            onPress={() => setSorting(orderKey as OrderProductsEnum)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Body size="medium">
                {orderProducts[orderKey as OrderProductsEnum].text}
              </Body>
              <Radio selected={filter.sorting === orderKey} />
            </View>
          </Pressable>
        ))}
      </View>
    </FilterSection>
  );
};
