"use client";

import React from "react";
import { Button, Divider, Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Partner } from "gql/graphql";
import { listPartners } from "@/queries/partner/list-partners";
import { queryKeys } from "@/lib/query-keys";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { ColumnsType } from "antd/es/table";
import Image from "next/image";

const PartnerTable = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PARTNER],
    queryFn: () => listPartners(),
  });

  const columns: ColumnsType<Partner> = [
    {
      title: "Bild",
      dataIndex: "logo",
      key: "logo",
      width: "160px",
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
    },
    {
      title: "Webbplats",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
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
      width: "180px",
      render: (_, { createdAt }) => <span>{formatDate(createdAt)}</span>,
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
