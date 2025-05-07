import { useState } from "react";
import { TextInput, Props as TextInputProps } from "./textInput";

export type Props = {
  value: number;
  onChange: (p: number) => void;
  onBlur?: (p: number) => void;
} & Omit<TextInputProps, "value" | "onChange" | "onBlur">;

export const PriceInput = ({ value, onChange, onBlur, ...props }: Props) => {
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const onChangePrice = (newPrice: string) => {
    const caretPos = newPrice.length;
    setSelection({ start: caretPos, end: caretPos });
    onChange(parseInt(newPrice, 10));
  };

  const onBlurPrice = (newPrice: string) => {
    onBlur?.(parseInt(newPrice, 10));
  };

  const handleSelectionChange = (e: any) => {
    const pos = e.nativeEvent.selection;
    const priceLength = value.toString().length;

    // Prevent caret from going into the "kr" part
    if (pos.start > priceLength || pos.end > priceLength) {
      setSelection({ start: priceLength, end: priceLength });
    } else {
      setSelection(pos);
    }
  };

  return (
    <TextInput
      inputType="numeric"
      value={value + " kr"}
      onChange={(p) => onChangePrice(p)}
      onSelectionChange={handleSelectionChange}
      selection={selection}
      onBlur={(p) => onBlurPrice(p)}
      placeholder="0 kr"
      {...props}
    />
  );
};
