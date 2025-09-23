"use client";

import React from "react";
import { Table, Checkbox } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listArticles } from "@/queries/article/list-articles";
import { Article } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { formatDate } from "@/utils/date-utils";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 10,
  page: 1,
};

type Props = {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
};

const SelectAricleTable = ({ articles, setArticles }: Props) => {
  const [state, setState] = useState(initialState);
  const { pageSize, page } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_ARTICLES, page, pageSize],
    queryFn: () => listArticles({ page: page - 1, pageSize }),
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
      title: "Lägg till",
      key: "action",
      width: "120px",
      render: (_, article) => {
        const isChecked = articles.some((a) => a.id === article.id);

        return (
          <Checkbox
            checked={isChecked}
            onChange={(e) => {
              if (e.target.checked) {
                setArticles([...articles, article]);
              } else {
                setArticles(articles.filter((a) => a.id !== article.id));
              }
            }}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.articles}
      bordered
      loading={isLoading}
      rowKey="id"
      size="middle"
      pagination={{
        current: page,
        pageSize: pageSize,
        total: data?.total,
        onChange: (page) => setState({ page }),
        pageSizeOptions: [10, 20, 35, 50],
        onShowSizeChange: (_, size) => setState({ pageSize: size }),
      }}
    />
  );
};

export default SelectAricleTable;
