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

type BaseFieldProps = {
  heading?: string;
  description?: string;
  helperText?: string;
};

type FieldType =
  | (BaseFieldProps & TextInputProps & { type: "text" })
  | (BaseFieldProps & SelectInputProps & { type: "select" })
  | (BaseFieldProps & ToggleInputProps & { type: "toggle" })
  | (BaseFieldProps & CheckboxInputProps & { type: "checkbox" });

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
            {field.type === "text" ? (
              <TextInput {...(rest as TextInputProps)} />
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
