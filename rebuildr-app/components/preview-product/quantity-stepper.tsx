import { QuantityUnitEnum } from "@/gql/graphql";
import { Icon } from "@components/icons/icon";
import { Body, Title } from "@components/typography/text";
import { quantities } from "@constants/quantities";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable, View } from "react-native";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  unit?: QuantityUnitEnum;
};

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max,
  unit,
}: Props) => {
  const colors = useThemeColor();
  const unitShort = unit ? quantities[unit].plural : null;

  const decrement = () => {
    if (value <= min) return;
    onChange(value - 1);
  };

  const increment = () => {
    if (value >= max) return;
    onChange(value + 1);
  };

  return (
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
          {value}
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
      {unitShort && <Title size="medium">{unitShort}</Title>}
    </View>
  );
};
