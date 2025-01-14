import { View } from "react-native";
import { TextInput } from "./textInput";
import { FormFieldWrapper } from "./formFieldWrapper";
import { SelectInput } from "./selectInput";
import { ToggleInput } from "./toggleInput";
import { CheckboxInput } from "./checkboxInput";
import { Props as TextInputProps } from "./textInput";
import { Props as SelectInputProps } from "./selectInput";
import { Props as ToggleInputProps } from "./toggleInput";
import { Props as CheckboxInputProps } from "./checkboxInput";

type FieldType = {
  heading?: string;
  description?: string;
  helperText?: string;
  type: "text" | "select" | "toggle" | "checkbox";
} & (TextInputProps | SelectInputProps | ToggleInputProps | CheckboxInputProps);

interface Props {
  fields: FieldType[];
}

export const Form = ({ fields }: Props) => {
  return (
    <View>
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
            {field.type === "text" ? <TextInput {...rest} /> : null}
            {field.type === "select" ? <SelectInput {...rest} /> : null}
            {field.type === "toggle" ? <ToggleInput {...rest} /> : null}
            {field.type === "checkbox" ? <CheckboxInput {...rest} /> : null}
          </FormFieldWrapper>
        );
      })}
    </View>
  );
};
