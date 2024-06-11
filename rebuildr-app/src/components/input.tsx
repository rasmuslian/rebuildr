import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";

interface InputProps extends Omit<TextInputProps, "onChange"> {
  placeholder?: string;
  errorMessage?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const Input = ({
  onChange,
  placeholder,
  value,
  disabled,
}: InputProps) => {
  return (
    <TextInput
      style={styles.container}
      onChangeText={onChange}
      placeholder={placeholder}
      value={value}
      editable={!disabled}
      selectTextOnFocus={disabled}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    minWidth: 300,
  },
});
