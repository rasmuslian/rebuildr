"use client";

import React from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { QuantityUnitEnum } from "gql/graphql";
import { quantities } from "@/constants/quantities";

type Props = {
  quantityUnit?: QuantityUnitEnum;
  onSelectQuantityUnit: (quantityUnit: QuantityUnitEnum) => void;
};

const SelectQuantityUnit = ({ quantityUnit, onSelectQuantityUnit }: Props) => {
  const options: SelectProps["options"] = [];
  const productQuantityUnits = Object.values(QuantityUnitEnum);

  productQuantityUnits?.forEach((productQuantityUnit) => {
    options.push({
      label: quantities[productQuantityUnit].short,
      value: productQuantityUnit,
    });
  });

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
