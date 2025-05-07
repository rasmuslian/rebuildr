import { StyleProp, View, ViewStyle } from "react-native";
import { FormFieldWrapper } from "./formFieldWrapper";
import { TextInput, Props as TextInputProps } from "./textInput";
import { MaskedInput, Props as MaskedInputProps } from "./maskedInput";
import { SearchInput, Props as SearchInputProps } from "./searchInput";
import { PriceInput, Props as PriceInputProps } from "./priceInput";
import { SelectInput, Props as SelectInputProps } from "./selectInput";
import { ToggleInput, Props as ToggleInputProps } from "./toggleInput";
import { CheckboxInput, Props as CheckboxInputProps } from "./checkboxInput";
import { ReactNode } from "react";

type BaseFieldProps = {
  heading?: string;
  description?: string | ReactNode;
  helperText?: string;
};

type FieldType =
  | (BaseFieldProps & TextInputProps & { type: "text" })
  | (BaseFieldProps & MaskedInputProps & { type: "masked" })
  | (BaseFieldProps & SearchInputProps & { type: "search" })
  | (BaseFieldProps & PriceInputProps & { type: "price" })
  | (BaseFieldProps & SelectInputProps & { type: "select" })
  | (BaseFieldProps & ToggleInputProps & { type: "toggle" })
  | (BaseFieldProps & CheckboxInputProps & { type: "checkbox" });

interface Props {
  fields: FieldType[];
  style?: StyleProp<ViewStyle>;
}

export const Form = ({ fields, style: _style }: Props) => {
  return (
    <View style={_style}>
      {fields.map((field, index) => {
        const { type, heading, description, helperText, ...rest } = field;

        return (
          <FormFieldWrapper
            key={index}
            horizontal={type === "checkbox" || type === "toggle"}
            heading={heading}
            description={description}
            helperText={helperText}
          >
            {field.type === "text" ? (
              <TextInput {...(rest as TextInputProps)} />
            ) : null}
            {field.type === "masked" ? (
              <MaskedInput {...(rest as MaskedInputProps)} />
            ) : null}
            {field.type === "search" ? (
              <SearchInput {...(rest as SearchInputProps)} />
            ) : null}
            {field.type === "price" ? (
              <PriceInput {...(rest as PriceInputProps)} />
            ) : null}
            {field.type === "select" ? (
              <SelectInput {...(rest as SelectInputProps)} />
            ) : null}
            {field.type === "toggle" ? (
              <ToggleInput {...(rest as ToggleInputProps)} />
            ) : null}
            {field.type === "checkbox" ? (
              <CheckboxInput {...(rest as CheckboxInputProps)} />
            ) : null}
          </FormFieldWrapper>
        );
      })}
    </View>
  );
};
