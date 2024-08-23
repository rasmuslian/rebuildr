import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { InputText } from "../texts/text";
import { textStyles } from "../texts/textStyles";
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
      {label && (
        <InputText style={styles.label} type="label">
          {label}
        </InputText>
      )}
      <TextInput
        {...props}
        style={[baseInputStyles.container, textStyles.input.default]}
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
