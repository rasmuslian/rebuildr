"use client";

import React from "react";
import { Table, Divider, Button } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listPageContents } from "@/queries/page-content/list-page-contents";
import { PageContent } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { getPageContentName } from "@/utils/page-content-utils";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 10,
  page: 1,
};

const PageContentTable = () => {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const { pageSize, page } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PAGE_CONTENTS, page, pageSize],
    queryFn: () => listPageContents({ page: page - 1, pageSize }),
  });

  const columns: ColumnsType<PageContent> = [
    {
      title: "Sida",
      dataIndex: "page",
      key: "page",
      width: "180px",
      ellipsis: true,
      render: (_, { page }) => <span>{getPageContentName(page)}</span>,
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
      title: "Updaterad",
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
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_PAGE_CONTENT}/${id}`)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Aktuella sidor</Divider>

      <Table
        columns={columns}
        dataSource={data?.articles}
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

export default PageContentTable;
