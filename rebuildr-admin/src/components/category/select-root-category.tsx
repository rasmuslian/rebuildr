"use client";

import React, { useMemo } from "react";
import EmptyContainer from "@/components/empty-container";
import { Select, SelectProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getRootCategories } from "@/queries/category/get-root-categories";
import { OrderCategoriesEnum } from "gql/graphql";

type Props = {
  value?: string;
  onChange: (categoryId?: string) => void;
};

const SelectRootCategory = ({ value, onChange }: Props) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: [queryKeys.LIST_ROOT_CATEGORIES],
    queryFn: () =>
      getRootCategories({ orderBy: OrderCategoriesEnum.OrderIndexAsc }),
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories],
  );

  return (
    <Select
      showSearch
      loading={isLoading}
      optionFilterProp="label"
      placeholder="Välj huvudkategori ..."
      value={isLoading ? undefined : value}
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

export default SelectRootCategory;
