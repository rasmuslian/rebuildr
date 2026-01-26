"use client";

import React, { useState } from "react";
import { Category, CmsUpdateCategoriesInput } from "gql/graphql";
import { notification, Tree } from "antd";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { convertCategoryToTreeData } from "@/utils/category-utils";
import { BasicDataNode, DataNode, EventDataNode } from "antd/es/tree";
import { Key } from "antd/es/table/interface";
import { useMutation } from "@tanstack/react-query";
import { updateCategoriesOrder } from "@/queries/category/update-category-order";
import { revalidate } from "@/actions/revalidate";
import { listCategories } from "@/queries/category/list-categories";

//There is an import bug from Tree so the type declaration is copied in here instead
export type NodeDragEventParams<
  TreeDataType extends BasicDataNode = DataNode,
  T = HTMLDivElement,
> = {
  event: React.DragEvent<T>;
  node: EventDataNode<TreeDataType>;
};

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
  const [isExpandLocked, setIsExpandLocked] = useState(false);
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateCategoriesInput) => {
      const response = await updateCategoriesOrder(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      notification.success({
        message: "Hurra!",
        description: "Ordningen har uppdaterats.",
      });
      await listCategories();
      await revalidate(`${routes.LIST_CATEGORY}`);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Ordningen kunde inte uppdateras.",
      });
    },
  });

  const onSelect = (selectedKeys: React.Key[]) => {
    const categoryId = String(selectedKeys[0]);
    router.push(`${routes.EDIT_CATEGORY}/${categoryId}`);
  };

  const onDrop = (
    dropEvent: NodeDragEventParams<DataNode> & {
      dragNode: EventDataNode<DataNode>;
      dragNodesKeys: Key[];
      dropPosition: number;
      dropToGap: boolean;
    },
  ) => {
    setIsExpandLocked(false);

    const dragPos = dropEvent.dragNode.pos.split("-");
    const targetPos = dropEvent.node.pos.split("-");

    const targetIsChild = targetPos.length === 3;
    const dragIsChild = dragPos.length === 3;

    if (!targetIsChild && dragIsChild) {
      //We have tried moving child up to parent
      return;
    }
    if (targetIsChild && (!dragIsChild || dragPos[1] !== targetPos[1])) {
      //We have either tried moving a parent into a parent OR we have tried moving a child into another parent
      return;
    }

    const dragIndex = parseInt(dragPos.at(-1) as string);
    const targetIndex = parseInt(targetPos.at(-1) as string);
    const parentIndex = parseInt(dragPos[1]);
    const siblingCategories = dragIsChild
      ? categories[parentIndex].children
      : categories.slice();

    let newOrder = siblingCategories;

    if (dragIndex > targetIndex) {
      //special case: targetIndex is 0 and dragIndex is 1.
      //Moving a category above and below index 0 both return targetIndex 1
      //so in this case is targetIndex 0
      const isSpecialCase = targetIndex === 0 && dragIndex === 1;

      if (isSpecialCase) {
        newOrder = [
          siblingCategories[1],
          siblingCategories[0],
          ...siblingCategories.slice(2),
        ];
      } else {
        const affectedIndex = targetIndex + 1;
        newOrder = siblingCategories.reduce((acc: Category[], curr, i) => {
          if (i < affectedIndex) {
            return [...acc, curr];
          }
          if (i === affectedIndex) {
            return [
              ...acc,
              siblingCategories.find(
                (c) => c.id === dropEvent.dragNode.key,
              ) as Category,
            ];
          }
          if (i > affectedIndex) {
            return [...acc, siblingCategories[i - 1]];
          }
          return acc;
        }, []);
      }
    }
    if (dragIndex < targetIndex) {
      newOrder = siblingCategories.reduce((acc: Category[], curr, i) => {
        if (i < targetIndex) {
          return [...acc, siblingCategories[i + 1]];
        }
        if (i === targetIndex) {
          return [
            ...acc,
            siblingCategories.find(
              (c) => c.id === dropEvent.dragNode.key,
            ) as Category,
          ];
        }
        if (i > targetIndex) {
          return [...acc, curr];
        }
        return acc;
      }, []);
    }

    const updateInputs: CmsUpdateCategoriesInput["updateInputs"] = newOrder.map(
      (c, i) => ({
        id: c.id,
        orderIndex: i,
      }),
    );
    mutateAsync({ updateInputs });
  };

  return (
    <Tree
      draggable
      onDragStart={() => {
        setIsExpandLocked(true);
      }}
      onDrop={onDrop}
      expandedKeys={state.expandedKeys}
      onExpand={(expandedKeys) => {
        if (isExpandLocked) return;
        setState({ expandedKeys });
      }}
      showLine
      onSelect={onSelect}
      treeData={convertCategoryToTreeData(categories)}
      style={{ padding: 16 }}
    />
  );
};

export default CategoryTree;
