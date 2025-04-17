import { Check } from "@components/controls/check";
import { TextInput } from "@components/forms/textInput";
import { Body, Display, Label } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useRef, useState } from "react";
import { View, TextInput as RNTextInput } from "react-native";

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
  const [price, setPrice] = useState(_price.toString());
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef<RNTextInput>(null);
  const colors = useThemeColor();

  useEffect(() => {
    setPrice(_price.toString());
  }, [_price]);

  const onChangePrice = (newPrice: string) => {
    const caretPos = newPrice.length;
    setSelection({ start: caretPos, end: caretPos });
    setPrice(newPrice);
  };

  const onBlurPrice = () => {
    const priceNumber = price.replace(/\D/g, "");
    onBlur(parseInt(priceNumber, 10));
  };

  const handleSelectionChange = (e: any) => {
    const pos = e.nativeEvent.selection;
    const priceLength = price.length;

    // Prevent caret from going into the "kr" part
    if (pos.start > priceLength || pos.end > priceLength) {
      setSelection({ start: priceLength, end: priceLength });
    } else {
      setSelection(pos);
    }
  };

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
      <TextInput
        ref={inputRef}
        value={price.toString() + " kr"}
        onChange={(p) => onChangePrice(p)}
        onSelectionChange={handleSelectionChange}
        selection={selection}
        onBlur={() => onBlurPrice()}
        placeholder="0 kr"
        inputType="numeric"
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
