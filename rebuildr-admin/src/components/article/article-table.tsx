"use client";

import React from "react";
import { Table, Divider, Button, App } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listArticles } from "@/queries/article/list-articles";
import { Article } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { deleteArticle } from "@/queries/article/delete-article";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 10,
  page: 1,
};

const ArticleTable = () => {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const { pageSize, page } = state;
  const { modal, notification } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_ARTICLES, page, pageSize],
    queryFn: () => listArticles({ page: page - 1, pageSize }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (articleId: string) => {
      const response = await deleteArticle(articleId);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_FOOTER_SECTIONS],
      });
      notification.success({
        message: "Artikeln har raderats!",
        description: "Artikeln har tagits bort från systemet.",
      });
    },
    onError: () => {
      notification.success({
        message: "Misslyckades",
        description: "Artikeln kunde tyvärr inte raderas. Försök igen.",
      });
    },
  });

  const confirmDelete = (title: string, id: string) => {
    modal.confirm({
      title: 'Säker på att du vill ta bort "' + title + '"?',
      content:
        "När du raderar artikeln kommer den inte längre vara tillgänglig och kan inte återställas.",
      async onOk() {
        mutate(id);
      },
      okText: "Radera",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Avbryt",
    });
  };

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
      render: (_, { id, title }) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<DeleteOutlined />}
              loading={isPending}
              onClick={() => confirmDelete(title, id)}
            />
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
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla artiklar</Divider>

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

export default ArticleTable;
