"use client";

import React from "react";
import { Category } from "gql/graphql";
import type { TreeDataNode } from "antd";
import { Tree } from "antd";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { usePersistedState } from "@/hooks/use-persisted-state";

type Props = {
  categories: Category[];
};

type StateType = {
  expandedKeys: React.Key[];
};

const initialState: StateType = {
  expandedKeys: [],
};

const convertToTreeData = (categories: Category[] = []): TreeDataNode[] => {
  return categories.map((category) => ({
    title: category.name,
    key: category.id,
    isLeaf: !category.hasChildren,
    children: category.children?.length
      ? convertToTreeData(category.children)
      : undefined,
  }));
};

const CategoryTree = ({ categories }: Props) => {
  const [state, setState] = usePersistedState("category-tree", initialState);
  const treeData = convertToTreeData(categories);
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
      treeData={treeData}
      style={{ padding: 16 }}
    />
  );
};

export default CategoryTree;
