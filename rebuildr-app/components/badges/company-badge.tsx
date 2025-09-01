import { View } from "react-native";
import React from "react";
import { Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { primitives } from "@constants/colors";

export function CompanyBadge() {
  return (
    <View
      style={{
        borderRadius: borderRadius.xSmall,
        backgroundColor: primitives.accent200,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Label size="small">Företag</Label>
    </View>
  );
}
