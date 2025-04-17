import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { Label } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

type OptionsType = {
  [key: string]: { name: string; conversion: number };
};
const meterOptions: OptionsType = {
  mm: {
    name: "mm",
    conversion: 1,
  },
  cm: {
    name: "cm",
    conversion: 10,
  },
  dm: {
    name: "dm",
    conversion: 100,
  },
  m: {
    name: "m",
    conversion: 1000,
  },
};
const kgOptions: OptionsType = {
  kg: {
    name: "kg/m",
    conversion: 1,
  },
};
export const measurementKeys = [
  "thickness",
  "height",
  "width",
  "length",
  "diameter",
  "weight",
] as const;
export type MeasurementType = (typeof measurementKeys)[number];
const measurements: {
  [key in (typeof measurementKeys)[number]]: {
    name: string;
    options: OptionsType;
  };
} = {
  thickness: {
    name: "Tjocklek",
    options: meterOptions,
  },
  height: {
    name: "Höjd",
    options: meterOptions,
  },
  width: {
    name: "Bredd",
    options: meterOptions,
  },
  length: {
    name: "Längd",
    options: meterOptions,
  },
  diameter: {
    name: "Diameter",
    options: meterOptions,
  },
  weight: {
    name: "Vikt",
    options: kgOptions,
  },
} as const;
export type MeasurementsObjectType = { [key in MeasurementType]?: number };

type Props = {
  thickness?: number;
  height?: number;
  width?: number;
  length?: number;
  diameter?: number;
  weight?: number;
  value: MeasurementsObjectType;
  onChange: (input: MeasurementType, value: number) => void;
};
export const MeasurementsSection = ({
  thickness: _thickness,
  height: _height,
  width: _width,
  length: _length,
  diameter: _diameter,
  weight: _weight,
  value,
  onChange,
}: Props) => {
  return (
    <View style={{ zIndex: 1 }}>
      <Label size="medium" style={{ marginBottom: 20 }}>
        Ange mått
      </Label>

      <View style={{ gap: 16 }}>
        {Object.keys(measurements).map((measurement, i, arr) => (
          <View key={i} style={{ zIndex: arr.length - i }}>
            <Measurement
              onChange={(m) => onChange(measurement as MeasurementType, m)}
              type={measurement as MeasurementType}
              initialValue={
                value[measurement as MeasurementType]?.toString() ?? "0"
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
};

type MeasurementProps = {
  onChange: (measurement: number) => void;
  type: MeasurementType;
  initialValue: string;
};
const Measurement = ({ onChange, type, initialValue }: MeasurementProps) => {
  const options = measurements[type].options;

  const [value, setValue] = useState(initialValue);
  const [option, setOption] = useState(Object.keys(options)[0]);

  const convert = () => {
    const measurement = parseInt(value, 10);
    onChange(measurement * measurements[type].options[option].conversion);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "flex-end",
      }}
    >
      <View style={{ minWidth: 213, gap: 4 }}>
        <Label size="medium">{measurements[type].name}</Label>
        <TextInput
          value={value}
          onBlur={() => convert()}
          onChange={(v) => setValue(v)}
          inputType="numeric"
        />
      </View>
      <View style={{ flex: 1 }}>
        <SelectInput
          value={option}
          options={Object.keys(options).map((o) => ({
            label: options[o].name,
            value: o,
          }))}
          onSelect={(value) => {
            setOption(value);
            setValue("0");
          }}
        />
      </View>
    </View>
  );
};
