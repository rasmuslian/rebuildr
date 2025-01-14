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
        {heading ? <View style={{ paddingBottom: 4 }}>{heading}</View> : null}
        {description ? (
          <View style={{ paddingBottom: 12 }}>{description}</View>
        ) : null}
      </View>
      <View>{children}</View>
      {helperText ? <View style={{ paddingTop: 12 }}>{helperText}</View> : null}
    </View>
  );
};
