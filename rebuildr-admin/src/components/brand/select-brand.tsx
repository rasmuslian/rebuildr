"use client";

import React, { useMemo } from "react";
import EmptyContainer from "@/components/empty-container";
import { Select, SelectProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listBrands } from "@/queries/brand/list-brand";

type Props = {
  value?: string;
  onChange: (brandId: string) => void;
};

const SelectBrand = ({ value, onChange }: Props) => {
  const { data: brands = [], isLoading } = useQuery({
    queryKey: [queryKeys.LIST_BRAND],
    queryFn: () => listBrands(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      brands.map((brand) => ({
        label: brand.name,
        value: brand.id,
      })),
    [brands],
  );

  return (
    <Select
      showSearch
      loading={isLoading}
      optionFilterProp="label"
      placeholder="Välj märke ..."
      value={value}
      options={options}
      onChange={onChange}
      notFoundContent={
        <EmptyContainer
          description={"Kunde inte hitta"}
          size="small"
          spinner={isLoading}
        />
      }
    />
  );
};

export default SelectBrand;
