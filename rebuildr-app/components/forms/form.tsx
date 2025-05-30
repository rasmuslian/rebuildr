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
const twoThirds = 2;
const oneThirds = 1;
type BaseFieldProps = {
  heading?: string;
  description?: string | ReactNode;
  helperText?: string;
  horizontalSize?: typeof oneThirds | typeof twoThirds | typeof fullSize;
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
            const { type, heading, description, helperText, ...rest } = field;

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
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};
