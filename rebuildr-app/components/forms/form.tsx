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

const fullSize = 3;
export type BaseFieldProps = {
  heading?: string;
  description?: string | ReactNode;
  helperText?: string;
  horizontalSize?: 1 | 2 | typeof fullSize;
  error?: string | boolean;
};

type FieldType =
  | (BaseFieldProps & Omit<TextInputProps, "error"> & { type: "text" })
  | (BaseFieldProps & Omit<MaskedInputProps, "error"> & { type: "masked" })
  | (BaseFieldProps & SearchInputProps & { type: "search" })
  | (BaseFieldProps & Omit<PriceInputProps, "error"> & { type: "price" })
  | (BaseFieldProps & SelectInputProps<string> & { type: "select" })
  | (BaseFieldProps & ToggleInputProps & { type: "toggle" })
  | (BaseFieldProps & CheckboxInputProps & { type: "checkbox" });

interface Props {
  fields: FieldType[];
  style?: StyleProp<ViewStyle>;
}

export const Form = ({ fields, style: _style }: Props) => {
  const fieldRows = fields.reduce((acc: FieldType[][], curr) => {
    const horizontalSize = curr.horizontalSize ?? fullSize;
    if (!acc.length) {
      return [[curr]];
    }

    const lastRow = acc.at(-1);
    if (!lastRow) {
      return [...acc, [curr]];
    }

    const rowSpace = lastRow.reduce(
      (acc, curr) => acc + (curr.horizontalSize ?? fullSize) / fullSize,
      0,
    );

    if (rowSpace + horizontalSize / fullSize <= 1) {
      return [...acc.slice(0, acc.length - 1), [...lastRow, curr]];
    }
    return [...acc, [curr]];
  }, []);

  return (
    <View style={_style}>
      {fieldRows.map((fieldRow, index) => (
        <View style={{ flexDirection: "row", gap: 16 }} key={index}>
          {fieldRow.map((field, i) => {
            const { type, heading, description, helperText, error, ...rest } =
              field;

            return (
              <View
                key={i}
                style={{ flex: (field.horizontalSize ?? fullSize) / fullSize }}
              >
                <FormFieldWrapper
                  horizontal={type === "checkbox" || type === "toggle"}
                  heading={heading}
                  description={description}
                  helperText={helperText}
                  error={error}
                >
                  {field.type === "text" ? (
                    <TextInput {...(rest as TextInputProps)} error={!!error} />
                  ) : null}
                  {field.type === "masked" ? (
                    <MaskedInput
                      {...(rest as MaskedInputProps)}
                      error={!!error}
                    />
                  ) : null}
                  {field.type === "search" ? (
                    <SearchInput {...(rest as SearchInputProps)} />
                  ) : null}
                  {field.type === "price" ? (
                    <PriceInput
                      {...(rest as PriceInputProps)}
                      error={!!error}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <SelectInput {...(rest as SelectInputProps<string>)} />
                  ) : null}
                  {field.type === "toggle" ? (
                    <ToggleInput {...(rest as ToggleInputProps)} />
                  ) : null}
                  {field.type === "checkbox" ? (
                    <CheckboxInput {...(rest as CheckboxInputProps)} />
                  ) : null}
                </FormFieldWrapper>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};
