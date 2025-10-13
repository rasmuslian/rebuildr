"use client";

import React from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { MeasurementUnitEnum } from "gql/graphql";
import { measurements, MeasurementType } from "@/constants/measurements";

type Props = {
  measurementType: MeasurementType;
  measurementUnit?: MeasurementUnitEnum;
  onSelectSeasurementUnit: (measurementUnit: MeasurementUnitEnum) => void;
};

const SelectMeasurement = ({
  measurementType,
  measurementUnit,
  onSelectSeasurementUnit,
}: Props) => {
  const measurement = measurements[measurementType];

  const options: SelectProps["options"] = Object.entries(
    measurement.options,
  ).map(([key, option]) => ({
    label: option.name,
    value: key,
  }));

  return (
    <Select
      showSearch
      optionFilterProp="label"
      placeholder={`Välj ${measurement.name.toLowerCase()} enhet ...`}
      options={options}
      defaultValue={measurementUnit}
      onChange={(measurementUnit) => onSelectSeasurementUnit(measurementUnit)}
      notFoundContent={
        <EmptyContainer description="Kunde inte hitta" size="small" />
      }
    />
  );
};

export default SelectMeasurement;
