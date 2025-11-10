import { FilterSection } from "./filter-section";
import { useState } from "react";
import { View } from "react-native";
import { Form } from "@components/forms/form";
import { Icon } from "@icons/icon";
import { useFilterProduct } from "@hooks/useFilterProduct";
import {
  initialFilterProduct,
  maximumPrice,
  minimumPrice,
} from "@context/filter-product-context";
import { Slider } from "@components/slider/slider";

export const PriceFilter = () => {
  const { filter, setPrice } = useFilterProduct();

  const [value1, setValue1] = useState(filter.price[0]);
  const [value2, setValue2] = useState(filter.price[1]);

  const onChangeMinPrice = (p: number) => {
    if (p < minimumPrice) {
      return;
    }
    const maxValue = value1 > value2 ? value1 : value2;

    if (p >= maxValue) {
      return;
    }

    const rounded = Math.round(p);
    setValue1(rounded);

    if (value1 <= value2) {
      setValue1(rounded);
    } else {
      setValue2(rounded);
    }
  };
  const onChangeMaxPrice = (p: number) => {
    if (p > maximumPrice) {
      return;
    }
    const minValue = value1 <= value2 ? value1 : value2;

    if (p < minValue) {
      return;
    }

    const rounded = Math.round(p);
    setValue2(rounded);

    if (value1 > value2) {
      setValue1(rounded);
    } else {
      setValue2(rounded);
    }
  };

  return (
    <FilterSection
      title="Pris"
      initialOpen={
        filter.price[0] !== initialFilterProduct.price[0] ||
        filter.price[1] !== initialFilterProduct.price[1]
      }
      collapsedText={`${filter.price[0]} kr - ${filter.price[1]} kr`}
    >
      <View style={{ gap: 24 }}>
        <Slider
          type="double"
          sliderProps={{
            value1: filter.price[0],
            value2: filter.price[1],
            min: minimumPrice,
            max: maximumPrice,
            width: 343,
            onChange: (v1, v2) => {
              setValue1(Math.round(v1));
              setValue2(Math.round(v2));
            },
            onRelease: (v1, v2) => {
              setPrice(Math.round(v1), Math.round(v2));
            },
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <Form
            style={{ flex: 1 }}
            fields={[
              {
                type: "price",
                value: value1 <= value2 ? value1 : value2,
                onChange: onChangeMinPrice,
                onBlur: () => setPrice(value1, value2),

                heading: "Lägst",
              },
            ]}
          />
          <Icon icon="arrowRight" style={{ marginBottom: 8 }} />
          <Form
            style={{ flex: 1 }}
            fields={[
              {
                type: "price",
                value: value1 > value2 ? value1 : value2,
                onChange: onChangeMaxPrice,
                onBlur: () => setPrice(value1, value2),
                heading: "Högst",
              },
            ]}
          />
        </View>
      </View>
    </FilterSection>
  );
};
