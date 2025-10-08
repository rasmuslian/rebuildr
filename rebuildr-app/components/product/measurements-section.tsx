import { MeasurementUnitEnum } from "@/gql/graphql";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { Label } from "@components/typography/text";
import {
  measurements,
  MeasurementsObjectType,
  MeasurementType,
} from "@constants/measurements";
import { View } from "react-native";

type Props = {
  value: MeasurementsObjectType;
  onChange: (
    input: MeasurementType,
    value: number,
    unit: MeasurementUnitEnum,
  ) => void;
};
export const MeasurementsSection = ({ value, onChange }: Props) => {
  return (
    <View style={{ zIndex: 1 }}>
      <Label size="medium" style={{ marginBottom: 20 }}>
        Ange mått
      </Label>

      <View style={{ gap: 16 }}>
        {Object.keys(measurements).map((measurement, i, arr) => (
          <View key={i} style={{ zIndex: arr.length - i }}>
            <Measurement
              onChange={(value, unit) =>
                onChange(measurement as MeasurementType, value, unit)
              }
              type={measurement as MeasurementType}
              initialValue={value[measurement as MeasurementType]?.value ?? 0}
              unit={value[measurement as MeasurementType]?.unit}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

type MeasurementProps = {
  onChange: (measurement: number, unit: MeasurementUnitEnum) => void;
  type: MeasurementType;
  initialValue: number;
  unit?: MeasurementUnitEnum;
};
const Measurement = ({
  onChange,
  type,
  initialValue,
  unit: _unit,
}: MeasurementProps) => {
  const options = measurements[type].options;
  const unit = _unit ? _unit : (Object.keys(options)[0] as MeasurementUnitEnum);

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
          value={initialValue.toString()}
          onChange={(v) => onChange(parseInt(v, 10), unit)}
          inputType="numeric"
        />
      </View>
      <View style={{ flex: 1 }}>
        <SelectInput
          value={unit}
          options={Object.keys(options).map((o) => ({
            label: options[o as MeasurementUnitEnum]?.name ?? "MISSING UNIT",
            value: o as MeasurementUnitEnum,
          }))}
          onSelect={(unit) => {
            onChange(initialValue, unit);
          }}
        />
      </View>
    </View>
  );
};
