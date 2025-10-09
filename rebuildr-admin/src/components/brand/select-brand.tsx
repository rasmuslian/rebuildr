"use client";

import React from "react";
import EmptyContainer from "@/components/empty-container";
import { Select, SelectProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listBrands } from "@/queries/brand/list-brand";

type Props = {
  brandId?: string;
  onSelectBrand: (brandId: string) => void;
};

const SelectBrand = ({ brandId, onSelectBrand }: Props) => {
  const options: SelectProps["options"] = [];

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_BRAND],
    queryFn: () => listBrands(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  const brands = data ?? [];

  brands.forEach((brand) => {
    options.push({
      label: brand.name,
      value: brand.id,
    });
  });

  return (
    <Select
      showSearch
      loading={isLoading}
      placeholder="Välj märke ..."
      defaultValue={brandId}
      options={options}
      onSelect={(value) => onSelectBrand(value)}
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
