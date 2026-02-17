import { QuantityUnitEnum } from "@/gql/graphql";
import { formatMeasurement, parseFloatComma } from "@/utils/formattings";
import { Form } from "@components/forms/form";
import { Body, Title } from "@components/typography/text";
import { ProductFields } from "@components/upsert-product/types";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useState } from "react";
import { View } from "react-native";

type Props = {
  product: ProductFields;
  onChange: (value: number) => void;
};

export const CO2Section = ({ product, onChange }: Props) => {
  const deriveWeight = () => {
    if (
      product.primaryUnit === QuantityUnitEnum.Kg &&
      product.primaryQuantity !== undefined
    ) {
      return formatMeasurement(product.primaryQuantity);
    }
    if (
      product.secondaryUnit === QuantityUnitEnum.Kg &&
      product.secondaryQuantity !== undefined
    ) {
      return formatMeasurement(product.secondaryQuantity);
    }
    if (product.weight) {
      return formatMeasurement(product.weight);
    }
    return undefined;
  };
  const [weight, setWeight] = useState(() => deriveWeight());

  useEffect(() => {
    const derivedWeight = deriveWeight();
    setWeight(derivedWeight);
    onChange(parseFloatComma(derivedWeight ?? "0"));
  }, [
    product.primaryQuantity,
    product.primaryUnit,
    product.secondaryQuantity,
    product.secondaryUnit,
  ]);

  const colors = useThemeColor();

  const onChangeWeight = (v: string) => {
    setWeight(v);
    const toFloat = parseFloatComma(v);
    onChange(toFloat);
  };

  return (
    <View
      style={{
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.medium,
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 24,
      }}
    >
      <View style={{ gap: 4 }}>
        <Title size="medium">Lägg till vikt för CO2 värde</Title>
        <Body size="medium" color="secondary">
          Uppskatta vikten för att erhålla CO2 besparing.
        </Body>
      </View>
      <Form
        fields={[
          {
            type: "text",
            heading: "Vikt (kg)",
            inputType: "decimal",
            value: weight,
            onChange: (v) => onChangeWeight(v),
            style: { backgroundColor: colors.background.neutral },
            disabled:
              product.primaryUnit === QuantityUnitEnum.Kg ||
              product.secondaryUnit === QuantityUnitEnum.Kg,
          },
        ]}
      />
    </View>
  );
};
