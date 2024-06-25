import React from "react";
import { TextInput } from "react-native";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface NumberInputProps extends BaseInputProps {
  onChange: (value: string) => void;
  value: string;
}

export const NumberInput = ({
  onChange,
  placeholder,
  value,
  disabled,
}: NumberInputProps) => {
  const onChangeNumber = (value: string) => {
    if (!value) {
      onChange(undefined);
    }
    const isNumberRegex = new RegExp(/^[0-9]*$/);
    if (!isNumberRegex.test(value)) {
      return;
    }

    onChange(value);
  };

  return (
    <TextInput
      style={baseInputStyles.container}
      onChangeText={onChangeNumber}
      placeholder={placeholder}
      value={value ?? ""}
      readOnly={disabled}
      selectTextOnFocus={disabled}
    />
  );
};
