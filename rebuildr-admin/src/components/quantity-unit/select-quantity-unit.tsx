"use client";

import React, { useMemo } from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { QuantityUnitEnum } from "gql/graphql";
import { quantities } from "@/constants/quantities";

type Props = {
  value?: QuantityUnitEnum;
  onChange: (quantityUnit: QuantityUnitEnum) => void;
};

const SelectQuantityUnit = ({ value, onChange }: Props) => {
  const options: SelectProps["options"] = useMemo(
    () =>
      Object.values(QuantityUnitEnum).map((unit) => ({
        label: quantities[unit].short,
        value: unit,
      })),
    [],
  );

  return (
    <Select
      optionFilterProp="label"
      placeholder="Välj enhet ..."
      size="middle"
      showSearch
      options={options}
      value={value}
      onChange={onChange}
      notFoundContent={
        <EmptyContainer description={"Kunde inte hitta"} size="small" />
      }
    />
  );
};

export default SelectQuantityUnit;
