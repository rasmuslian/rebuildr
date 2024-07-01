import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Body } from "../texts/text";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface InputProps extends BaseInputProps {
  label?: string;
}

export const Input = ({
  onChange,
  placeholder,
  value,
  disabled,
  label,
  ...props
}: InputProps) => {
  return (
    <View style={props.style}>
      {label && <Body style={styles.label}>{label}</Body>}
      <TextInput
        {...props}
        style={baseInputStyles.container}
        onChangeText={onChange}
        placeholder={placeholder}
        value={value}
        readOnly={disabled}
        selectTextOnFocus={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 5,
  },
});
