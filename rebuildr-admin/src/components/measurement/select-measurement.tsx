"use client";

import React from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { MeasurementTypeEnum, MeasurementUnitEnum } from "gql/graphql";
import { measurements } from "@/constants/measurements";

type Props = {
  measurementType: MeasurementTypeEnum;
  value?: MeasurementUnitEnum;
  onChange: (measurementUnit: MeasurementUnitEnum) => void;
};

const SelectMeasurement = ({ measurementType, value, onChange }: Props) => {
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
      placeholder="Välj enhet ..."
      size="middle"
      options={options}
      value={value}
      onChange={onChange}
      notFoundContent={
        <EmptyContainer description="Kunde inte hitta" size="small" />
      }
    />
  );
};

export default SelectMeasurement;
