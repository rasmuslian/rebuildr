"use client";

import React from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";

import { formatNumber } from "@/components/statistics/format";
import Panel from "@/components/ui/panel";
import {
  getUsersByCity,
  UsersByCityEntry,
} from "@/queries/statistics/users-by-city";

const COLUMNS: ColumnsType<UsersByCityEntry> = [
  { title: "Stad", dataIndex: "city" },
  {
    title: "Användare",
    dataIndex: "count",
    align: "right",
    width: 120,
    render: (count: number) => formatNumber(count),
  },
];

const UsersByCityTable = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users-by-city"],
    queryFn: () => getUsersByCity(),
  });

  return (
    <Panel className="flex max-w-2xl flex-col gap-3">
      <h5 className="text-title-medium m-0">Användare per stad</h5>
      <Table
        size="small"
        rowKey="city"
        loading={isLoading}
        pagination={false}
        columns={COLUMNS}
        dataSource={data?.cities ?? []}
      />
      {data && data.unknownCount > 0 ? (
        <p className="text-body-small m-0 text-gray-500">
          {formatNumber(data.unknownCount)} användare saknar registrerad stad.
        </p>
      ) : null}
    </Panel>
  );
};

export default UsersByCityTable;
