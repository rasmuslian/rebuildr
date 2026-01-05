import { ColorTypeEnum } from "@/gql/graphql";
import { Toggle } from "@components/controls/toggle";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { Label, Title } from "@components/typography/text";
import { colorTypes, ColorTypesType } from "@constants/product-color-types";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  color?: string;
  type: ColorTypeEnum;
  onChange: (color: string, type: ColorTypeEnum) => void;
};

export const ColorSection = ({ color, type, onChange }: Props) => {
  const [selected, setSelected] = useState(() => {
    return !!color;
  });

  const selectedColor = color ?? "";

  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 18,
        }}
      >
        <Title size="medium">Lägg till färg</Title>
        <Toggle value={selected} onPress={() => setSelected(!selected)} />
      </View>
      {selected && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <View style={{ minWidth: 213, gap: 4 }}>
            <Label size="medium">Ange färgkod</Label>
            <TextInput
              value={selectedColor}
              placeholder={type === ColorTypeEnum.Ncs ? "S 3010-Y30R" : "Grön"}
              onChange={(c) => {
                onChange(c, type);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SelectInput
              value={type}
              options={Object.keys(colorTypes).map((o) => ({
                label: colorTypes[o as ColorTypesType].text,
                value: o,
              }))}
              onSelect={(unit) => {
                onChange("", unit as ColorTypeEnum);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};
