import React from "react";
import { TextInput } from "react-native";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface InputProps extends BaseInputProps {}

export const Input = ({
  onChange,
  placeholder,
  value,
  disabled,
}: InputProps) => {
  return (
    <TextInput
      style={baseInputStyles.container}
      onChangeText={onChange}
      placeholder={placeholder}
      value={value}
      editable={!disabled}
      selectTextOnFocus={disabled}
    />
  );
};
