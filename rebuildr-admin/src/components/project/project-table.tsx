"use client";

import React, { useCallback } from "react";
import { useState } from "@/hooks/use-state";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Table, Divider, Button, App } from "antd";
import { useRouter } from "next/navigation";
import { listProjects } from "@/queries/project/list-projects";
import SearchField from "@components/search-field";
import { debounce } from "lodash";
import { ColumnsType } from "antd/es/table";
import { Project } from "gql/graphql";
import { routes } from "@/lib/routes";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { deleteProject } from "@/queries/project/delete-project";

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

const ProjectTable = () => {
  const [state, setState] = useState(initialState);
  const { searchString, pageSize, page } = state;
  const router = useRouter();
  const { modal, notification } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PROJECTS, page, pageSize, searchString],
    queryFn: () => listProjects({ page: page - 1, pageSize, searchString }),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await deleteProject(projectId);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PROJECTS] });
      notification.success({
        message: "Projektet har raderats",
        description:
          "Projektet har tagits bort och är inte längre synlig för andra användare.",
      });
    },
    onError: () => {
      notification.error({
        message: "Raderingen misslyckades",
        description: "Projektet kunde tyvärr inte raderas. Försök igen senare.",
      });
    },
  });

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const confirmDelete = (title: string, id: string) => {
    modal.confirm({
      title: 'Säker på att du vill ta bort "' + title + '"?',
      content:
        "Om du raderar projektet tas alla tillhörande bilder och dokument bort permanent. Produkter som ingår i projektet påverkas inte och kommer att finnas kvar.",
      async onOk() {
        await deleteMutation(id);
      },
      okText: "Radera",
      okButtonProps: {
        danger: true,
        loading: isDeleting,
      },
      cancelText: "Avbryt",
    });
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Projektnamn",
      dataIndex: "title",
      key: "title",
      width: "250px",
    },
    {
      title: "Ägare",
      key: "user",
      width: "220px",
      render: (_, { user }) => (
        <span>{user?.name}{user?.email ? ` (${user.email})` : ""}</span>
      ),
    },
    {
      title: "Kontaktuppgifter",
      key: "contact",
      children: [
        {
          title: "Namn",
          key: "contactName",
          width: "180px",
          render: (_, { contactName }) => <span>{contactName}</span>,
        },
        {
          title: "Email",
          key: "contactEmail",
          width: "300px",
          render: (_, { contactEmail }) => <span>{contactEmail}</span>,
        },
        {
          title: "Telefon",
          key: "contactPhone",
          width: "180px",
          render: (_, { contactPhone }) => <span>{contactPhone}</span>,
        },
      ],
    },
    {
      title: "Adress",
      dataIndex: "address",
      key: "address",
      width: "320px",
    },
    {
      title: "Administrera",
      key: "action",
      width: "80px",
      fixed: "right",
      render: (_, { id, title }) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_PROJECT}/${id}`)}
            />
            <Button
              type="dashed"
              size="middle"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(title, id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla projekt</Divider>

      <SearchField
        placeholder="Sök på namn"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.products}
        bordered
        scroll={{ x: "max-content" }}
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

export default ProjectTable;
