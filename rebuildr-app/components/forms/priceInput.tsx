import { TextInput, Props as TextInputProps } from "./textInput";
import { useThemeColor } from "@hooks/useThemeColor";

export type Props = {
  value?: number;
  onChange: (p: number) => void;
  onBlur?: (p: number) => void;
} & Omit<TextInputProps, "value" | "onChange" | "onBlur">;

export const PriceInput = ({
  value: _value,
  onChange,
  onBlur,
  ...props
}: Props) => {
  const colors = useThemeColor();

  const onChangePrice = (newPrice: string) => {
    onChange(parseInt(newPrice, 10));
  };

  const onBlurPrice = (newPrice: string) => {
    onBlur?.(parseInt(newPrice, 10));
  };

  return (
    <TextInput
      inputType="numeric"
      value={(_value ?? "") + " kr"}
      textColor={_value === undefined ? colors.text.secondary : undefined}
      onChange={(p) => onChangePrice(p)}
      selection={
        _value
          ? {
              start: _value.toString().length,
              end: _value.toString().length,
            }
          : { start: 0, end: 0 }
      }
      onBlur={(p) => onBlurPrice(p)}
      placeholder="kr"
      {...props}
    />
  );
};
