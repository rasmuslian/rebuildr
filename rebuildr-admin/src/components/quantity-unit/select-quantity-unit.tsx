"use client";

import React, { useMemo } from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { QuantityUnitEnum } from "gql/graphql";
import { quantities } from "@/constants/quantities";

type Props = {
  quantityUnit?: QuantityUnitEnum;
  onSelectQuantityUnit: (quantityUnit: QuantityUnitEnum) => void;
};

const SelectQuantityUnit = ({ quantityUnit, onSelectQuantityUnit }: Props) => {
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
      showSearch
      options={options}
      defaultValue={quantityUnit}
      onChange={(value) => onSelectQuantityUnit(value)}
      notFoundContent={
        <EmptyContainer description={"Kunde inte hitta"} size="small" />
      }
    />
  );
};

export default SelectQuantityUnit;
