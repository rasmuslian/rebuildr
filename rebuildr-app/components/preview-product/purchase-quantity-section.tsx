import { QuantityUnitEnum } from "@/gql/graphql";
import { formatPrice } from "@/utils/formattings";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { quantities } from "@constants/quantities";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { borderRadius } from "@constants/sizes";
import { QuantityStepper } from "./quantity-stepper";

type Props = {
  pricePerUnit: number;
  selectedQuantity: number;
  totalQuantity: number;
  primaryUnit: QuantityUnitEnum;
  onQuantityChange: (quantity: number) => void;
};

export const PurchaseQuantitySection = ({
  pricePerUnit,
  selectedQuantity: _selectedQuantity,
  totalQuantity,
  primaryUnit,
  onQuantityChange,
}: Props) => {
  const colors = useThemeColor();
  const [selectedQuantity, setSelectedQuantity] = useState(_selectedQuantity);
  const unitShort = quantities[primaryUnit].plural;
  const totalPrice = pricePerUnit * selectedQuantity;

  const handleChange = (next: number) => {
    setSelectedQuantity(next);
    onQuantityChange(next);
  };

  return (
    <View
      style={{
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
        padding: 16,
      }}
    >
      <Headline size="small" style={{ marginBottom: 8 }}>
        Delköp
      </Headline>

      <View style={{ gap: 6, marginBottom: 12 }}>
        <Label size="medium">Kvarvarande till försäljning</Label>
        <View style={{ gap: 12, flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: colors.buttons.tonal.hovered,
              borderRadius: borderRadius.medium,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <Body size="large">{totalQuantity}</Body>
          </View>
          <Title size="medium">{unitShort}</Title>
        </View>
      </View>

      <View style={{ gap: 6, marginBottom: 16 }}>
        <Label size="medium">Välj mängd / enhet</Label>
        <QuantityStepper
          value={selectedQuantity}
          onChange={handleChange}
          max={totalQuantity}
          unit={primaryUnit}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label size="medium">Totalpris vid delköp</Label>
        <Headline size="large">{formatPrice(totalPrice)}</Headline>
      </View>
    </View>
  );
};
