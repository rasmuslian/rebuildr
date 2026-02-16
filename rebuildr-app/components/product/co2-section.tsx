import { QuantityUnitEnum } from "@/gql/graphql";
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
      return product.primaryQuantity;
    }
    if (
      product.secondaryUnit === QuantityUnitEnum.Kg &&
      product.secondaryQuantity !== undefined
    ) {
      return product.secondaryQuantity;
    }
    if (product.weight) {
      return product.weight;
    }
    return 0;
  };
  const [weight, setWeight] = useState(() => deriveWeight());

  useEffect(() => {
    const derivedWeight = deriveWeight();
    setWeight(derivedWeight);
    onChange(derivedWeight);
  }, [
    product.primaryQuantity,
    product.primaryUnit,
    product.secondaryQuantity,
    product.secondaryUnit,
    product.weight,
  ]);

  const colors = useThemeColor();

  const onChangeWeight = (v: string) => {
    const toInt = parseInt(v, 10);
    onChange(toInt);
    setWeight(toInt);
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
            inputType: "numeric",
            value: weight.toString(),
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
