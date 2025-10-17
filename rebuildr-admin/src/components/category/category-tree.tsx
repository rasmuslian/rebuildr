"use client";

import React from "react";
import { Category } from "gql/graphql";
import { Tree } from "antd";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { convertCategoryToTreeData } from "@/utils/category-utils";

type Props = {
  categories: Category[];
};

type StateType = {
  expandedKeys: React.Key[];
};

const initialState: StateType = {
  expandedKeys: [],
};

const CategoryTree = ({ categories }: Props) => {
  const [state, setState] = usePersistedState("category-tree", initialState);
  const router = useRouter();

  const onSelect = (selectedKeys: React.Key[]) => {
    const categoryId = String(selectedKeys[0]);
    router.push(`${routes.EDIT_CATEGORY}/${categoryId}`);
  };

  return (
    <Tree
      expandedKeys={state.expandedKeys}
      onExpand={(expandedKeys) => setState({ expandedKeys })}
      showLine
      onSelect={onSelect}
      treeData={convertCategoryToTreeData(categories)}
      style={{ padding: 16 }}
    />
  );
};

export default CategoryTree;
