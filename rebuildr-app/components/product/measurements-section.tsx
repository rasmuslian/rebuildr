import {
  MeasurementsSectionQuery,
  MeasurementsSectionQueryVariables,
  MeasurementTypeEnum,
  MeasurementUnitEnum,
} from "@/gql/graphql";
import { formatMeasurement, parseFloatComma } from "@/utils/formattings";
import { gql, useQuery } from "@apollo/client";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Label } from "@components/typography/text";
import { measurements, MeasurementsObjectType } from "@constants/measurements";
import { useState } from "react";
import { View } from "react-native";

const MEASUREMENTS_SECTION = gql`
  query MeasurementsSection($input: CategoryInput!) {
    category(input: $input) {
      id
      measurements
    }
  }
`;

type Props = {
  categoryId: string;
  value: MeasurementsObjectType;
  onChange: (
    input: MeasurementTypeEnum,
    value: number,
    unit: MeasurementUnitEnum,
  ) => void;
};
export const MeasurementsSection = ({ categoryId, value, onChange }: Props) => {
  const { data } = useQuery<
    MeasurementsSectionQuery,
    MeasurementsSectionQueryVariables
  >(MEASUREMENTS_SECTION, {
    variables: { input: { id: categoryId } },
  });

  if (!data) {
    return <LoadingSpinner />;
  }
  return (
    <View style={{ zIndex: 1 }}>
      <Label size="medium" style={{ marginBottom: 20 }}>
        Ange mått
      </Label>

      <View style={{ gap: 16 }}>
        {data.category.measurements.map((measurement, i, arr) => (
          <View key={i} style={{ zIndex: arr.length - i }}>
            <Measurement
              onChange={(value, unit) => {
                onChange(measurement, value, unit);
              }}
              type={measurement}
              initialValue={value[measurement]?.value ?? 0}
              unit={value[measurement]?.unit}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

type MeasurementProps = {
  onChange: (value: number, unit: MeasurementUnitEnum) => void;
  type: MeasurementTypeEnum;
  initialValue: number;
  unit?: MeasurementUnitEnum;
};
const Measurement = ({
  onChange: _onChange,
  type,
  initialValue,
  unit: _unit,
}: MeasurementProps) => {
  const [value, setValue] = useState(
    initialValue ? formatMeasurement(initialValue) : undefined,
  );

  const onChange = (v: string | undefined, unit: MeasurementUnitEnum) => {
    setValue(v);
    _onChange(parseFloatComma(v ?? "0"), unit);
  };
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
          placeholder={initialValue.toString()}
          value={value}
          onChange={(v) => onChange(v, unit)}
          inputType="decimal"
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
            onChange(value, unit);
          }}
        />
      </View>
    </View>
  );
};
