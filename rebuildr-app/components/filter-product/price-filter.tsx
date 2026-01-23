import { FilterSection } from "./filter-section";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Form } from "@components/forms/form";
import { Icon } from "@icons/icon";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { Slider } from "@components/slider/slider";
import { gql, useQuery } from "@apollo/client";
import { PriceFilterQuery } from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const PRICE_FILTER = gql`
  query PriceFilter {
    getProductPriceRange {
      min
      max
    }
  }
`;

export const PriceFilter = () => {
  const { filter, filterBuilder } = useFilterProduct();

  const [value1, setValue1] = useState(filter.price[0]);
  const [value2, setValue2] = useState(filter.price[1]);

  const { data } = useQuery<PriceFilterQuery>(PRICE_FILTER);

  useEffect(() => {
    if (!data) return;
    if (!value1 || !value2) {
      setValue1(data.getProductPriceRange.min);
      setValue2(data.getProductPriceRange.max);
    }
  }, [data]);

  const onChangeMinPrice = (p: number) => {
    if (!data) return;
    if (p < data.getProductPriceRange.min) {
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
    if (!data) return;
    if (p > data.getProductPriceRange.max) {
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

  if (!data || !value1) {
    return <LoadingSpinner />;
  }

  return (
    <FilterSection
      title="Pris"
      initialOpen={
        value1 !== data.getProductPriceRange.min ||
        value2 !== data.getProductPriceRange.max
      }
      collapsedText={`${value1} kr - ${value2} kr`}
    >
      <View style={{ gap: 24 }}>
        <Slider
          type="double"
          sliderProps={{
            value1,
            value2,
            min: data.getProductPriceRange.min,
            max: data.getProductPriceRange.max,
            width: 343,
            onChange: (v1, v2) => {
              setValue1(Math.round(v1));
              setValue2(Math.round(v2));
            },
            onRelease: (v1, v2) => {
              filterBuilder.setPrice(Math.round(v1), Math.round(v2)).apply();
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
                onBlur: () => filterBuilder.setPrice(value1, value2).apply(),

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
                onBlur: () => filterBuilder.setPrice(value1, value2).apply(),
                heading: "Högst",
              },
            ]}
          />
        </View>
      </View>
    </FilterSection>
  );
};
