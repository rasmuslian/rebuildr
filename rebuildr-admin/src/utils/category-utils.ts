import { Category } from "gql/graphql";
import type { TreeDataNode } from "antd";

export const convertCategoryToTreeData = (
  categories: Category[] = [],
): TreeDataNode[] => {
  return categories.map((category) => ({
    title: category.name,
    key: category.id,
    value: category.id,
    isLeaf: !category.hasChildren,
    children: category.children?.length
      ? convertCategoryToTreeData(category.children)
      : undefined,
  }));
};
