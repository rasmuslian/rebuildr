import { ColorTypeEnum } from "@/gql/graphql";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { Label } from "@components/typography/text";
import { colorTypes, ColorTypesType } from "@constants/product-color-types";
import { useEffect, useState } from "react";
import { View } from "react-native";

type Props = {
  color?: string;
  type: ColorTypeEnum;
  onChange: (color: string, type: ColorTypeEnum) => void;
};

export const ColorSection = ({ color: _color, type, onChange }: Props) => {
  const [color, setColor] = useState(_color ?? "");
  const selectedColor = color ?? "";

  useEffect(() => {
    if (_color) {
      setColor(_color);
    }
  }, [_color]);

  const onChangeColor = (c: string) => {
    setColor(c);
    onChange(c, type);
  };

  return (
    <View style={{ gap: 16 }}>
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
            onChange={onChangeColor}
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
    </View>
  );
};
