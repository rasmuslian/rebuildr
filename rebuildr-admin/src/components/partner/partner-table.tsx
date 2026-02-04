"use client";

import React from "react";
import { App, Button, Divider, Modal, Table } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Partner } from "gql/graphql";
import { listPartners } from "@/queries/partner/list-partners";
import { deletePartner } from "@/queries/partner/delete-partner";
import { queryKeys } from "@/lib/query-keys";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { ColumnsType } from "antd/es/table";
import Image from "next/image";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const PartnerTable = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PARTNER],
    queryFn: () => listPartners(),
  });

  const { mutate: onDeletePartner, isPending: isDeleting } = useMutation({
    mutationFn: async (partnerId: string) => {
      const response = await deletePartner({ id: partnerId });
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PARTNER] });
      notification.success({
        message: "Hurra!",
        description: "Partnern har tagits bort.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Partnern kunde inte tas bort.",
      });
    },
  });

  const confirmDelete = (partner: Partner) => {
    Modal.confirm({
      title: "Ta bort Partner",
      content: `Är du säker på att du vill ta bort ${partner.name}?`,
      okText: "Ta bort",
      okButtonProps: { danger: true, loading: isDeleting },
      cancelText: "Avbryt",
      onOk: () => onDeletePartner(partner.id),
    });
  };

  const columns: ColumnsType<Partner> = [
    {
      title: "Bild",
      dataIndex: "logo",
      key: "logo",
      width: "80px",
      render: (_, { logo, name }) => (
        <div className="relative h-16 w-28 overflow-hidden rounded-md bg-neutral-100">
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={name}
              fill
              sizes="112px"
              className="object-contain"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      ),
    },
    {
      title: "Namn",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: "160px",
    },
    {
      title: "Webbplats",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      width: "160px",
      ellipsis: true,
      render: (_, { websiteUrl }) =>
        websiteUrl ? (
          <a
            className="text-primary-600"
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
          >
            {websiteUrl}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Skapad",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "80px",
      render: (_, { createdAt }) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "Administrera",
      key: "action",
      width: "80px",
      fixed: "right",
      render: (_, partner) => (
        <div className="flex flex-row items-center justify-center gap-4">
          <Button
            type="dashed"
            size="middle"
            icon={<EditOutlined />}
            onClick={() => router.push(`${routes.EDIT_PARTNER}/${partner.id}`)}
          />
          <Button
            type="dashed"
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(partner)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla partners</Divider>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
};

export default PartnerTable;
