"use client";

import React from "react";
import EmptyContainer from "@/components/empty-container";
import { TreeSelect } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listCategories } from "@/queries/category/list-categories";
import { convertCategoryToTreeData } from "@/utils/category-utils";

type Props = {
  categoryId?: string;
  onSelectCategory: (categoryId: string) => void;
};

const SelectCategory = ({ categoryId, onSelectCategory }: Props) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_CATEGORY],
    queryFn: () => listCategories(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <TreeSelect
      treeLine
      showSearch
      loading={isLoading}
      placeholder="Välj kategori ..."
      size="large"
      defaultValue={categoryId}
      treeData={convertCategoryToTreeData(categories)}
      treeNodeFilterProp="title"
      onSelect={(value) => onSelectCategory(value)}
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
