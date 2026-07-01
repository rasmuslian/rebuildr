"use client";

import React, { useCallback } from "react";
import { Table, Divider, Button, Tag, Popconfirm, Switch } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listPendingBusinesses } from "@/queries/user/list-pending-businesses";
import { approveBusiness } from "@/queries/user/approve-business";
import { updateUser } from "@/queries/user/update-user";
import { User } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { CheckOutlined } from "@ant-design/icons";
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

const BusinessTable = () => {
  const [state, setState] = useState(initialState);
  const { pageSize, page, searchString } = state;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PENDING_BUSINESSES, page, pageSize, searchString],
    queryFn: () =>
      listPendingBusinesses({ page: page - 1, pageSize, searchString }),
  });

  const { mutate: approve, isPending } = useMutation({
    mutationFn: (userId: string) => approveBusiness(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_PENDING_BUSINESSES],
      });
    },
  });

  const { mutate: updateInternalAdsAccess, isPending: updatingAccess } =
    useMutation({
      mutationFn: (user: User) =>
        updateUser({
          id: user.id,
          role: user.role,
          internalAdsAccess: !user.internalAdsAccess,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.LIST_PENDING_BUSINESSES],
        });
      },
    });

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const columns: ColumnsType<User> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "280px",
    },
    {
      title: "Användarnamn",
      dataIndex: "username",
      key: "username",
      width: "180px",
    },
    {
      title: "Organisationsnummer",
      dataIndex: "organizationNumber",
      key: "organizationNumber",
      width: "180px",
    },
    {
      title: "Status",
      key: "status",
      width: "140px",
      render: (_, { organizationApprovedAt }) =>
        organizationApprovedAt ? (
          <Tag color="green">Godkänd</Tag>
        ) : (
          <Tag color="orange">Väntar</Tag>
        ),
    },
    {
      title: "Registrerad",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "160px",
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString("sv-SE") : "—",
    },
    {
      title: "Internlagret",
      key: "internalAdsAccess",
      width: "150px",
      render: (_, user) => (
        <Switch
          checked={!!user.internalAdsAccess}
          loading={updatingAccess}
          checkedChildren="På"
          unCheckedChildren="Av"
          onChange={() => updateInternalAdsAccess(user)}
        />
      ),
    },
    {
      title: "Åtgärd",
      key: "action",
      width: "120px",
      fixed: "right",
      render: (_, user) =>
        !user.organizationApprovedAt ? (
          <Popconfirm
            title="Godkänn företagskonto"
            description={`Godkänn ${user.email}?`}
            onConfirm={() => approve(user.id)}
            okText="Godkänn"
            cancelText="Avbryt"
          >
            <Button
              type="primary"
              size="middle"
              icon={<CheckOutlined />}
              loading={isPending}
            >
              Godkänn
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Företagskonton</Divider>

      <SearchField
        placeholder="Sök på namn, email eller organisationsnummer"
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
    </div>
  );
};

export default BusinessTable;
