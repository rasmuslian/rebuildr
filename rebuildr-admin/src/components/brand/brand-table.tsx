"use client";

import React, { useCallback } from "react";
import { Table, Divider, Button } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Brand } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { listBrands } from "@/queries/brand/list-brands";
import { debounce } from "lodash";
import SearchField from "@components/search-field";

type StateType = {
  searchString: string;
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  searchString: "",
  pageSize: 10,
  page: 1,
};

const BrandTable = () => {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const { pageSize, page, searchString } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_BRAND, page, pageSize, searchString],
    queryFn: () => listBrands({ page: page - 1, pageSize, searchString }),
  });

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const columns: ColumnsType<Brand> = [
    {
      title: "Namn",
      dataIndex: "name",
      key: "name",
      width: "100%",
      ellipsis: true,
    },
    {
      title: "Skapad",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "180px",
      ellipsis: true,
      render: (_, { createdAt }) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "Uppdaterad",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: "180px",
      ellipsis: true,
      render: (_, { updatedAt }) => <span>{formatDate(updatedAt)}</span>,
    },
    {
      title: "Administrera",
      key: "action",
      width: "120px",
      render: (_, { id }) => {
        return (
          <div className="flex flex-row items-center justify-center">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_BRAND}/${id}`)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla varumärken</Divider>

      <SearchField
        placeholder="Sök på namn"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.brands}
        bordered
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total,
          onChange: (page) => setState({ page }),
          pageSizeOptions: [10, 20, 35, 50],
          onShowSizeChange: (_, size) => setState({ pageSize: size }),
        }}
      />
    </div>
  );
};

export default BrandTable;
