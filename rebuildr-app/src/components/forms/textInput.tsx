import { TextInput as RNTextInput, TextInputProps } from "react-native";

export type Props = TextInputProps;

export const TextInput = ({ ...props }: Props) => {
  return (
    <RNTextInput
      style={{
        borderWidth: 1,
        borderColor: "black",
        padding: 16,
        paddingRight: 12,
        backgroundColor: "white",
        borderRadius: 8,
        height: 40,
      }}
      {...props}
    />
  );
};
