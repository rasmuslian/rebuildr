import { TextInputProps, StyleSheet } from "react-native";
import Colors from "src/styles/colors";

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
    borderColor: Colors.borderGray,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
});
