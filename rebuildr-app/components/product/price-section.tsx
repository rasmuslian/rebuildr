import { Check } from "@components/controls/check";
import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type Props = {
  price: number;
  minimumPrice: number;
  priceError?: string;
  isGiveaway: boolean;
  onUpdate: (isGiveaway: boolean, price: number) => void;
};

export const PriceSection = ({
  price,
  minimumPrice,
  priceError,
  isGiveaway,
  onUpdate,
}: Props) => {
  const colors = useThemeColor();

  const priceHigherThan = minimumPrice - 1;

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
      <Form
        fields={[
          {
            type: "price",
            value: price,
            heading: "Pris",
            description:
              priceHigherThan > 0
                ? `Du kan antingen ange ett pris över ${priceHigherThan} kr, eller markera att varan bortskänkes (0 kr).`
                : undefined,
            onChange: (p) => {
              const newPrice = Math.max(0, p);
              onUpdate(newPrice <= 0, newPrice);
            },
            error: priceError,
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
        <Check
          selected={isGiveaway}
          onPress={() => {
            onUpdate(!isGiveaway, isGiveaway ? 0 : price);
          }}
        />
        <Body size="medium">Bortskänkes</Body>
      </View>
    </View>
  );
};
