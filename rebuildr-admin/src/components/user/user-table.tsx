"use client";

import React, { useCallback } from "react";
import { Table, Divider, Button, Tag, Modal } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listUsers } from "@/queries/user/list-users";
import { User, UserRoleEnum, UserType } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import SearchField from "@components/search-field";
import EditUser from "./edit-user";

type StateType = {
  searchString: string;
  pageSize: number;
  page: number;
  isEditing: boolean;
  selectedUser?: User;
};

const initialState: StateType = {
  searchString: "",
  pageSize: 10,
  page: 1,
  isEditing: false,
  selectedUser: undefined,
};

const UserTable = () => {
  const [state, setState] = useState(initialState);
  const { pageSize, page, searchString } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_USERS, page, pageSize, searchString],
    queryFn: () => listUsers({ page: page - 1, pageSize, searchString }),
  });

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const columns: ColumnsType<User> = [
    {
      title: "Användarnamn",
      dataIndex: "username",
      key: "username",
      width: "180px",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "300px",
    },
    {
      title: "Telefon",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "180px",
    },
    {
      title: "Konto",
      dataIndex: "type",
      key: "type",
      width: "120px",
      render: (_, { type }) => {
        switch (type) {
          case UserType.Personal:
            return <Tag color="blue">Privat</Tag>;
          case UserType.Business:
            return <Tag color="red">Företag</Tag>;
        }
      },
    },
    {
      title: "Admin",
      dataIndex: "role",
      key: "role",
      width: "80px",
      render: (_, { role }) =>
        role === UserRoleEnum.Admin ? (
          <CheckOutlined style={{ color: "green" }} />
        ) : (
          <CloseOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Administrera",
      key: "action",
      width: "120px",
      fixed: "right",
      render: (_, user) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => {
                setState({ isEditing: true, selectedUser: user });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla användare</Divider>

      <SearchField
        placeholder="Sök på namn eller email"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.users}
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

      {state.selectedUser && (
        <Modal
          open={state.isEditing}
          onCancel={() => setState({ isEditing: false })}
          afterClose={() => setState({ selectedUser: undefined })}
          footer={false}
          width={980}
        >
          <EditUser
            user={state.selectedUser}
            onSettled={() => setState({ isEditing: false })}
          />
        </Modal>
      )}
    </div>
  );
};

export default UserTable;
