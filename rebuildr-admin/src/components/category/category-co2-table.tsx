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
import EditCO2Factor from "@/components/category/edit-co2-factor";
import { Co2FactorWithDisposal } from "@/queries/co2-factor/update-co2-factor";

type CategoryWithDisposal = Omit<Category, "co2Factor"> & {
  co2Factor?: Co2FactorWithDisposal | null;
};

const CategoryCO2Table = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCo2Factor, setSelectedCo2Factor] =
    useState<Co2FactorWithDisposal | null>(null);
  const [isEditingFactor, setIsEditingFactor] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.CATEGORIES_CO2_FACTOR, "co2"],
    queryFn: categoryCO2Factor,
  });

  const flattenedCategories = useMemo(() => {
    if (!data) return [];
    return data.reduce(
      (flattenedCategories: CategoryWithDisposal[], rootCategory) => {
        const { children, ...parent } = rootCategory;
        return [
          ...flattenedCategories,
          parent as CategoryWithDisposal,
          ...(children as CategoryWithDisposal[]),
        ];
      },
      [],
    );
  }, [data]);

  const columns: ColumnsType<CategoryWithDisposal> = [
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
      key: "co2FactorGroup",
      children: [
        {
          title: "Kategori",
          dataIndex: ["co2Factor", "categoryName", "productName"],
          key: "co2Factor",
          width: "220px",
          ellipsis: true,
          render: (_, record) => {
            if (!record.co2Factor) return <span>-</span>;
            const { categoryName, productName } = record.co2Factor;
            return (
              <span>
                {categoryName}, {productName}
              </span>
            );
          },
        },
        {
          title: "Produktionskoefficient",
          key: "productionCoefficient",
          width: "120px",
          render: (_, record) => {
            if (!record.co2Factor) return <span>-</span>;
            return <span>{record.co2Factor.productionCoefficient}</span>;
          },
        },
        {
          title: "Deponikoefficient",
          key: "disposalCoefficient",
          width: "150px",
          render: (_, record) => {
            if (!record.co2Factor) return <span>-</span>;
            return (
              <div className="flex flex-row items-center gap-2">
                <span>{record.co2Factor.disposalCoefficient}</span>
                <Button
                  type="dashed"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedCo2Factor(record.co2Factor!);
                    setIsEditingFactor(true);
                  }}
                />
              </div>
            );
          },
        },
      ],
    },
    {
      title: "Redigera",
      key: "action",
      width: "80px",
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex flex-row items-center justify-center gap-2">
            <Button
              disabled={!record.parentId}
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              title="Byt CO2-faktor"
              onClick={() => {
                setSelectedCategory(record as Category);
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
      {selectedCo2Factor && (
        <Modal
          open={isEditingFactor}
          onCancel={() => setIsEditingFactor(false)}
          afterClose={() => setSelectedCo2Factor(null)}
          footer={false}
          width={600}
        >
          <EditCO2Factor
            co2Factor={selectedCo2Factor}
            onSettled={() => setIsEditingFactor(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default CategoryCO2Table;
