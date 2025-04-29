import { Check } from "@components/controls/check";
import { Form } from "@components/forms/form";
import { Body, Display, Label } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  price: number;
  isGiveaway: boolean;
  onSelectGiveaway: () => void;
  onBlur: (price: number) => void;
};

export const PriceSection = ({
  price: _price,
  isGiveaway,
  onSelectGiveaway,
  onBlur,
}: Props) => {
  const [price, setPrice] = useState(_price);
  const colors = useThemeColor();

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
        paddingBottom: 16,
      }}
    >
      <Display size="small" style={{ marginBottom: 24 }}>
        Pris
      </Display>
      <Label size="medium" style={{ marginBottom: 4 }}>
        Pris
      </Label>
      <Form
        fields={[
          {
            type: "price",
            value: price,
            onChange: (p) => setPrice(p),
            onBlur: (p) => onBlur(p),
          },
        ]}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <Check selected={isGiveaway} onPress={() => onSelectGiveaway()} />
        <Body size="medium">Bortskänkes</Body>
      </View>
    </View>
  );
};
