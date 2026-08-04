import { QuantityUnitEnum } from "@/gql/graphql";
import { Form } from "@components/forms/form";
import { Body, Title } from "@components/typography/text";
import { ProductFields } from "@components/upsert-product/types";
import { quantities } from "@constants/quantities";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useEffect, useState } from "react";
import { View } from "react-native";

type Props = {
  compact?: boolean;
  product: ProductFields;
  onChange: (value: number) => void;
};

export const CO2Section = ({ compact = false, product, onChange }: Props) => {
  const deriveWeight = () => {
    if (product.soldByQuantity && product.primaryUnit === QuantityUnitEnum.Kg) {
      return 1;
    }
    if (!product.soldByQuantity) {
      if (
        product.primaryUnit === QuantityUnitEnum.Kg &&
        product.primaryQuantity !== undefined
      ) {
        return product.primaryQuantity;
      }
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
    product.weight,
    product.soldByQuantity,
  ]);

  const onChangeWeight = (v: string) => {
    const toInt = parseInt(v, 10);
    onChange(toInt);
    setWeight(toInt);
  };

  const unit = product.primaryUnit
    ? quantities[product.primaryUnit].singular
    : "enhet";

  return (
    <View
      style={{
        backgroundColor: primitives.accent100,
        borderRadius: compact ? 0 : borderRadius.medium,
        paddingHorizontal: compact ? 0 : 16,
        paddingVertical: compact ? 0 : 24,
        gap: compact ? 8 : 24,
      }}
    >
      <View style={{ gap: 4 }}>
        <Title size={compact ? "small" : "medium"}>Vikt för CO₂</Title>
        {!compact && (
          <Body size="medium" color="secondary">
            Uppskatta vikten så vi kan beräkna klimatbesparingen. Vid delköp
            räknas besparingen automatiskt om till såld mängd.
          </Body>
        )}
      </View>
      <Form
        fields={[
          {
            type: "text",
            heading: product.soldByQuantity
              ? `Vikt per ${unit} (kg / ${unit})`
              : "Total vikt (kg)",
            inputType: "numeric",
            placeholder: weight.toString(),
            value: weight !== 0 ? weight.toString() : "",
            onChange: (v) => onChangeWeight(v),
            style: { backgroundColor: primitives.accent100 },
            disabled: product.primaryUnit === QuantityUnitEnum.Kg,
          },
        ]}
      />
    </View>
  );
};
