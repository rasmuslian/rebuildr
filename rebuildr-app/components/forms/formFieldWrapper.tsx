import { Body, Label } from "@components/typography/text";
import React from "react";
import { View } from "react-native";

type Props = {
  heading?: string;
  description?: string;
  helperText?: string;
  children: React.ReactNode;
  horizontal?: boolean;
};

export const FormFieldWrapper = ({
  heading,
  description,
  helperText,
  horizontal,
  children,
}: Props) => {
  return (
    <View>
      <View style={{ flexDirection: horizontal ? "row" : "column" }}>
        {heading ? (
          <View style={{ paddingBottom: 4 }}>
            <Label size="medium">{heading}</Label>
          </View>
        ) : null}
        {description ? (
          <View style={{ paddingBottom: 12 }}>
            <Body size="small" color="secondary">
              {description}
            </Body>
          </View>
        ) : null}
      </View>
      <View>{children}</View>
      {helperText ? (
        <View style={{ paddingTop: 12 }}>
          <Body size="small" color="secondary">
            {helperText}
          </Body>
        </View>
      ) : null}
    </View>
  );
};
