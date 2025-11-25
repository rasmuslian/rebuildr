import {
  TextInputSelectionChangeEvent,
  TextInput as RNTextInput,
} from "react-native";
import { TextInput, Props as TextInputProps } from "./textInput";
import { useThemeColor } from "@hooks/useThemeColor";
import { useRef, useState } from "react";

export type Props = {
  value?: number;
  onChange: (p: number) => void;
  onBlur?: (p: number) => void;
} & Omit<TextInputProps, "value" | "onChange" | "onBlur">;

export const PriceInput = ({ value, onChange, onBlur, ...props }: Props) => {
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const colors = useThemeColor();
  const ref = useRef<RNTextInput>(null);
  const suffix = " kr";

  const format = (digits: string) => {
    return (
      digits
        .replace(/\D/g, "") // remove non-digits
        .replace(/(\d)(?=(\d{3})+$)/g, "$1 ") + suffix
    );
  };
  const onChangePrice = (newPrice: string) => {
    const oldFormatted = format(value ? value.toString() : "");
    const newFormatted = format(newPrice);

    // how formatting changed length
    const diff = newFormatted.length - oldFormatted.length;

    // prevent cursor going into the suffix
    const cursorBeforeSuffix =
      selection.start <= oldFormatted.length - suffix.length;

    const newCursorPos = cursorBeforeSuffix
      ? selection.start + diff
      : newFormatted.length - suffix.length;

    onChange(parseInt(newPrice, 10));

    requestAnimationFrame(() => {
      setSelection({
        start: newCursorPos,
        end: newCursorPos,
      });
    });
  };

  const onBlurPrice = (newPrice: string) => {
    onBlur?.(parseInt(newPrice, 10));
  };

  const getValue = () => {
    const _value = value !== undefined ? value.toString() : "";
    return format(_value);
  };

  const stringValue = getValue();

  const handleSelectionChange = (e: TextInputSelectionChangeEvent) => {
    const pos = e.nativeEvent.selection;
    const priceLength = stringValue.length - suffix.length;

    // Prevent caret from going into the "kr" part
    if (pos.start > priceLength || pos.end > priceLength) {
      ref.current?.setSelection(priceLength, priceLength);
      setSelection({ start: priceLength, end: priceLength });
    } else {
      setSelection(pos);
    }
  };

  return (
    <TextInput
      inputType="numeric"
      value={stringValue}
      textColor={value === undefined ? colors.text.secondary : undefined}
      onChange={(p) => onChangePrice(p)}
      onSelectionChange={handleSelectionChange}
      selection={selection}
      onBlur={(p) => onBlurPrice(p)}
      placeholder="kr"
      {...props}
    />
  );
};
