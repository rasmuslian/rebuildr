import { QuantityUnitEnum } from "@/gql/graphql";
import { formatPrice } from "@/utils/formattings";
import { Icon } from "@components/icons/icon";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { quantities } from "@constants/quantities";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { borderRadius } from "@constants/sizes";

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

  const decrement = () => {
    if (selectedQuantity <= 1) return;
    const next = selectedQuantity - 1;
    setSelectedQuantity(next);
    onQuantityChange(next);
  };

  const increment = () => {
    if (selectedQuantity >= totalQuantity) return;
    const next = selectedQuantity + 1;
    setSelectedQuantity(next);
    onQuantityChange(next);
  };

  return (
    <View
      style={{
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
        padding: 16,
        // gap: 16,
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
          <Title size="medium" style={{ flex: 1 }}>
            {unitShort}
          </Title>
        </View>
      </View>

      <View style={{ gap: 6, marginBottom: 16 }}>
        <Label size="medium">Välj mängd / enhet</Label>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.dividers.neutral,
              borderRadius: borderRadius.medium,
              backgroundColor: colors.background.neutral,
              paddingHorizontal: 8,
              paddingVertical: 8,
              gap: 8,
              flex: 1,
            }}
          >
            <Pressable
              onPress={decrement}
              style={{
                width: 24,
                height: 24,
                backgroundColor: colors.buttons.tonal.enabled,
                borderRadius: borderRadius.xSmall,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="-" size={10} color="primaryDark" />
            </Pressable>
            <Body size="large" style={{ flex: 1, textAlign: "center" }}>
              {selectedQuantity}
            </Body>
            <Pressable
              onPress={increment}
              style={{
                width: 24,
                height: 24,
                backgroundColor: colors.buttons.tonal.enabled,
                borderRadius: borderRadius.xSmall,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="+" size={10} color="primaryDark" />
            </Pressable>
          </View>
          <Title size="medium" style={{ flex: 1 }}>
            {unitShort}
          </Title>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Label size="medium">Totalpris vid delköp</Label>
        <Headline size="large">{formatPrice(totalPrice)}</Headline>
      </View>
    </View>
  );
};
