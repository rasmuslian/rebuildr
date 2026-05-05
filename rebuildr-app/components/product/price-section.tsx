import { Check } from "@components/controls/check";
import { Toggle } from "@components/controls/toggle";
import { TextInput } from "@components/forms/textInput";
import { Body, Display, Label } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type Props = {
  price?: number;
  minimumPrice: number;
  priceError?: string;
  isGiveaway: boolean;
  onUpdate: (isGiveaway: boolean, price?: number) => void;
  soldByQuantity: boolean;
  onUpdateSoldByQuantity: (value: boolean) => void;
};

export const PriceSection = ({
  price,
  minimumPrice,
  priceError,
  isGiveaway,
  onUpdate,
  soldByQuantity,
  onUpdateSoldByQuantity,
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
      <Label size="medium" style={{ marginBottom: 4 }}>
        {soldByQuantity ? "Pris per enhet" : "Pris*"}
      </Label>
      {priceHigherThan > 0 ? (
        <View style={{ paddingBottom: 12 }}>
          <Body size="small" color="secondary">
            {`Du kan antingen ange ett pris över ${priceHigherThan} kr, eller markera att varan bortskänkes (0 kr).`}
          </Body>
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <TextInput
          inputType="numeric"
          value={price !== undefined ? price.toString() : ""}
          placeholder={soldByQuantity ? "Ange styckepris" : "Ange totalpris"}
          onChange={(priceString) => {
            const priceInt = parseInt(priceString, 10);
            const newPrice = Math.max(0, priceInt);
            onUpdate(newPrice <= 0, newPrice);
          }}
          error={!!priceError}
          style={
            soldByQuantity
              ? {
                  backgroundColor: colors.buttons.tonal.enabled,
                  borderColor: colors.text.link,
                }
              : undefined
          }
        />
        <Label size="medium">{soldByQuantity ? "Kr/Enhet" : "kr"}</Label>
      </View>
      {!!priceError && (
        <Body color="error" size="small" style={{ marginTop: 12 }}>
          {priceError}
        </Body>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          backgroundColor: soldByQuantity
            ? colors.buttons.tonal.enabled
            : colors.buttons.tonal.disabled,
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Label size="medium">Tillåt delköp</Label>
          <Body size="medium" color="secondary">
            Köpare kan köpa hela mängden eller delar av den. Annonsen ligger
            kvar tills allt är sålt
          </Body>
        </View>
        <Toggle
          value={soldByQuantity}
          onPress={() => onUpdateSoldByQuantity(!soldByQuantity)}
        />
      </View>
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
            onUpdate(!isGiveaway, isGiveaway ? undefined : 0);
          }}
        />
        <Body size="medium">Bortskänkes</Body>
      </View>
    </View>
  );
};
