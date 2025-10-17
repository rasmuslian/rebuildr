"use client";

import React, { useMemo } from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { ProductConditionEnum } from "gql/graphql";
import { conditions } from "@/constants/conditions";

type Props = {
  value: ProductConditionEnum;
  onChange: (condition: ProductConditionEnum) => void;
};

const SelectCondition = ({ value, onChange }: Props) => {
  const options: SelectProps["options"] = useMemo(
    () =>
      Object.values(ProductConditionEnum).map((condition) => ({
        label: conditions[condition].name,
        value: condition,
      })),
    [],
  );

  return (
    <Select
      optionFilterProp="label"
      placeholder="Välj skick ..."
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

export default SelectCondition;
