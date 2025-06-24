import { Body, Label } from "@components/typography/text";
import React from "react";
import { View } from "react-native";

type Props = {
  heading?: string;
  description?: string | React.ReactNode;
  helperText?: string;
  children: React.ReactNode;
  horizontal?: boolean;
  error?: string;
};

export const FormFieldWrapper = ({
  heading,
  description,
  helperText,
  horizontal,
  error,
  children,
}: Props) => {
  return (
    <View style={{ flexDirection: horizontal ? "row" : "column" }}>
      <View>
        {heading ? (
          <View style={{ paddingBottom: 4 }}>
            <Label size="medium">{heading}</Label>
          </View>
        ) : null}
        {description ? (
          <View style={{ paddingBottom: 12 }}>
            {typeof description === "string" ? (
              <Body size="small" color="secondary">
                {description}
              </Body>
            ) : (
              description
            )}
          </View>
        ) : null}
      </View>
      <View>{children}</View>
      {error && (
        <Body color="error" size="small" style={{ marginTop: 12 }}>
          {error}
        </Body>
      )}
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
