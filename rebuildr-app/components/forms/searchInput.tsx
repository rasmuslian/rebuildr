import { TextInput, Props as TextInputProps } from "./textInput";

export type Props = {} & Omit<TextInputProps, "trailing">;

export const SearchInput = (props: Props) => {
  return (
    <TextInput
      trailing={[
        {
          icon: props.value ? "X" : "search",
          onPress: () => {
            if (props.value) {
              props.onChange?.("");
            }
          },
        },
      ]}
      {...props}
    />
  );
};
