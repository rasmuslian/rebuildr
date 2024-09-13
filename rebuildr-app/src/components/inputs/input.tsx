import React, { ReactNode, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { InputText } from "../texts/text";
import { textStyles } from "../texts/textStyles";
import { BaseInputProps, baseInputStyles } from "./baseInput";
import { useOutsidePress } from "src/hooks/useOutsidePress";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef();
  useOutsidePress(ref, () => setShowDropdown(false));

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
      {dropdown && showDropdown && (
        <View style={{ position: "relative" }} ref={ref}>
          <View style={[styles.dropdownContainer]}>{dropdown}</View>
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
});
