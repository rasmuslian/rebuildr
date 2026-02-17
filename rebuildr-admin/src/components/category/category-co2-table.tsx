"use client";

import React, { useMemo, useState } from "react";
import { Button, Modal, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { Category } from "gql/graphql";
import { queryKeys } from "@/lib/query-keys";
import { categoryCO2Factor } from "@/queries/category/category-co2";
import { EditOutlined } from "@ant-design/icons";
import EditCO2Relation from "@/components/category/edit-co2-relation";

const CategoryCO2Table = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.CATEGORIES_CO2_FACTOR, "co2"],
    queryFn: categoryCO2Factor,
  });

  const flattenedCategories = useMemo(() => {
    if (!data) return [];
    return data.reduce((flattenedCategories: Category[], rootCategory) => {
      const { children, ...parent } = rootCategory;
      return [...flattenedCategories, parent as Category, ...children];
    }, []);
  }, [data]);

  const columns: ColumnsType<Category> = [
    {
      title: "Kategori",
      dataIndex: "name",
      key: "name",
      width: "150px",
      ellipsis: true,
      render: (_, record) => {
        return (
          <span style={{ marginLeft: record.parentId ? 10 : 0 }}>
            {record.name}
          </span>
        );
      },
    },
    {
      title: "CO2 Faktor",
      dataIndex: ["co2Factor", "categoryName", "coefficient", "productName"],
      key: "co2Factor",
      width: "220px",
      ellipsis: true,
      render: (_, record) => {
        if (!record.co2Factor) {
          return <span>-</span>;
        }
        const { coefficient, categoryName, productName } = record.co2Factor;
        return (
          <span>
            {coefficient}, {categoryName}, {productName}
          </span>
        );
      },
    },
    {
      title: "Redigera faktor",
      key: "action",
      width: "50px",
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              disabled={!record.parentId}
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCategory(record);
                setIsEditing(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={flattenedCategories}
        bordered
        loading={isLoading}
        rowKey="id"
        pagination={false}
      />
      {selectedCategory && (
        <Modal
          open={isEditing}
          onCancel={() => setIsEditing(false)}
          afterClose={() => setSelectedCategory(null)}
          footer={false}
          width={980}
        >
          <EditCO2Relation
            category={selectedCategory}
            onSettled={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default CategoryCO2Table;
