"use client";

import React, { useMemo } from "react";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { ColorTypeEnum } from "gql/graphql";
import { colorTypes } from "@/constants/product-color-types";

type Props = {
  value: ColorTypeEnum;
  onChange: (colorType: ColorTypeEnum) => void;
};

const SelectColorType = ({ value, onChange }: Props) => {
  const options: SelectProps["options"] = useMemo(
    () =>
      Object.values(ColorTypeEnum).map((colorType) => ({
        label: colorTypes[colorType].text,
        value: colorType,
      })),
    [],
  );

  return (
    <Select
      optionFilterProp="label"
      placeholder="Välj färg ..."
      showSearch
      options={options}
      value={value}
      onChange={onChange}
      size="middle"
      notFoundContent={
        <EmptyContainer description={"Kunde inte hitta"} size="small" />
      }
    />
  );
};

export default SelectColorType;
