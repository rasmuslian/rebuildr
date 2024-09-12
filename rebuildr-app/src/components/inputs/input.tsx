import React, { ReactNode, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { InputText } from "../texts/text";
import { textStyles } from "../texts/textStyles";
import { BaseInputProps, baseInputStyles } from "./baseInput";

interface InputProps extends BaseInputProps {
  label?: string;
  dropdown?: ReactNode;
}

export const Input = ({
  onChange,
  placeholder,
  value,
  disabled,
  label,
  dropdown,
  ...props
}: InputProps) => {
  const [showDropdown, setShowDropdown] = useState(true);
  return (
    <View style={[props.style, { zIndex: showDropdown && 10 }]}>
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
        onFocus={() => setShowDropdown(!showDropdown)}
      />
      {dropdown && (
        <View style={{ position: "relative" }}>
          <View
            style={[
              styles.dropdownContainer,
              { display: !showDropdown ? "none" : undefined },
            ]}
          >
            {dropdown}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 5,
  },
  dropdownContainer: {
    position: "absolute",
    overflow: "hidden",
    width: "100%",
    top: 4,
  },
  dropdownContainer2: {
    overflow: "hidden",
    width: "100%",
    top: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
