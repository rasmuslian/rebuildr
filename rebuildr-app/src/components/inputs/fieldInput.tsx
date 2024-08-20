import React from "react";
import { TextInput } from "react-native";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface FieldInputProps extends BaseInputProps {}

const HEIGHT_PER_LINE = 30;
export const FieldInput = ({
  onChange,
  placeholder,
  value,
  disabled,
  numberOfLines = 3,
  ...props
}: FieldInputProps) => {
  return (
    <TextInput
      {...props}
      style={[
        baseInputStyles.container,
        { height: numberOfLines * HEIGHT_PER_LINE },
      ]}
      onChangeText={onChange}
      placeholder={placeholder}
      value={value}
      readOnly={disabled}
      selectTextOnFocus={disabled}
      multiline={true}
    />
  );
};
