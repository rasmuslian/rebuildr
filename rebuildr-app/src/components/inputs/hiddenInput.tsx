import React from "react";
import { TextInput } from "react-native";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface HidddenInputProps extends BaseInputProps {}

export const HiddenInput = ({
  onChange,
  placeholder,
  value,
  disabled,
}: HidddenInputProps) => {
  return (
    <TextInput
      style={baseInputStyles.container}
      onChangeText={onChange}
      placeholder={placeholder}
      value={value}
      readOnly={disabled}
      selectTextOnFocus={disabled}
      secureTextEntry={true}
    />
  );
};
