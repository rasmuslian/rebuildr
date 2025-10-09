"use client";

import React from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { ProductConditionEnum } from "gql/graphql";
import { conditions } from "@/constants/conditions";

type Props = {
  condition: ProductConditionEnum;
  onSelectCondition: (condition: ProductConditionEnum) => void;
};

const SelectCondition = ({ condition, onSelectCondition }: Props) => {
  const options: SelectProps["options"] = [];
  const productConditions = Object.values(ProductConditionEnum);

  productConditions?.forEach((productCondition) => {
    options.push({
      label: conditions[productCondition].name,
      value: productCondition,
    });
  });

  return (
    <Select
      optionFilterProp="label"
      placeholder="Välj skick ..."
      showSearch
      options={options}
      defaultValue={condition}
      onChange={(value) => onSelectCondition(value)}
      notFoundContent={
        <EmptyContainer description={"Kunde inte hitta"} size="small" />
      }
    />
  );
};

export default SelectCondition;
