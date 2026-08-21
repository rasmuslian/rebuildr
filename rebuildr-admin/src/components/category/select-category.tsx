"use client";

import React, { useMemo } from "react";
import EmptyContainer from "@/components/empty-container";
import { TreeSelect } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listCategories } from "@/queries/category/list-categories";
import { convertCategoryToTreeData } from "@/utils/category-utils";

type Props = {
  value?: string;
  onChange: (categoryId: string) => void;
};

const SelectCategory = ({ value, onChange }: Props) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_CATEGORY],
    queryFn: () => listCategories(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  const treeData = useMemo(
    () =>
      convertCategoryToTreeData(
        categories?.filter((category) => category.categoryType !== "GIVEAWAY"),
      ),
    [categories],
  );

  return (
    <TreeSelect
      treeLine
      showSearch
      loading={isLoading}
      placeholder="Välj kategori ..."
      size="large"
      value={isLoading ? undefined : value}
      treeData={treeData}
      treeNodeFilterProp="title"
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

export default SelectCategory;
