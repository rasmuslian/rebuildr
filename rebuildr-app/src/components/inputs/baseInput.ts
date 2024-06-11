import { TextInputProps, StyleSheet } from "react-native";

export interface BaseInputProps extends Omit<TextInputProps, "onChange"> {
  placeholder?: string;
  errorMessage?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const baseInputStyles = StyleSheet.create({
  container: {
    padding: 10,
    minWidth: 300,
  },
});
