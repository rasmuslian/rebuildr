"use client";

import React, { useCallback } from "react";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Table, Divider, Button } from "antd";
import { useRouter } from "next/navigation";
import { listProjects } from "@/queries/project/list-projects";
import SearchField from "@components/search-field";
import { debounce } from "lodash";
import { ColumnsType } from "antd/es/table";
import { Project } from "gql/graphql";
import { routes } from "@/lib/routes";
import { EditOutlined } from "@ant-design/icons";

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

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PROJECTS, page, pageSize, searchString],
    queryFn: () => listProjects({ page: page - 1, pageSize, searchString }),
  });

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const columns: ColumnsType<Project> = [
    {
      title: "Projektnamn",
      dataIndex: "title",
      key: "title",
      width: "250px",
      ellipsis: true,
    },
    {
      title: "Kontakt uppgifter",
      key: "contact",
      children: [
        {
          title: "Namn",
          key: "contactName",
          width: "180px",
          ellipsis: true,
          render: (_, { contactName }) => <span>{contactName}</span>,
        },
        {
          title: "Email",
          key: "contactEmail",
          width: "300px",
          ellipsis: true,
          render: (_, { contactEmail }) => <span>{contactEmail}</span>,
        },
        {
          title: "Telefon",
          key: "contactPhone",
          width: "180px",
          ellipsis: true,
          render: (_, { contactPhone }) => <span>{contactPhone}</span>,
        },
      ],
    },
    {
      title: "Adress",
      dataIndex: "address",
      key: "address",
      width: "320px",
      ellipsis: true,
    },
    {
      title: "Administrera",
      key: "action",
      width: "80px",
      ellipsis: true,
      render: (_, { id }) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_PROJECT}/${id}`)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla projekter</Divider>

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
