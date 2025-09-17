"use client";

import React from "react";
import { Table, Divider, Button } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listArticles } from "@/queries/article/list-articles";
import { Article } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 10,
  page: 0,
};

const ListArticlePage = () => {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const { pageSize, page } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_ARTICLES, page, pageSize],
    queryFn: () => listArticles({ page, pageSize }),
  });

  const columns: ColumnsType<Article> = [
    {
      title: "Rubrik",
      dataIndex: "title",
      key: "title",
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
          <div className="flex flex-row items-center justify-center">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_ARTICLE}/${id}`)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Divider orientation="left">Alla artiklar</Divider>

      <Table
        columns={columns}
        dataSource={data?.articles}
        bordered
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page + 1,
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

export default ListArticlePage;
