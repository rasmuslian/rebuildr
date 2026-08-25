"use client";

import React from "react";
import { Button, Divider, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Banner } from "gql/graphql";
import { listBanners } from "@/queries/banner/list-banners";
import { queryKeys } from "@/lib/query-keys";
import { formatDate } from "@/utils/date-utils";
import { routes } from "@/lib/routes";
import { ColumnsType } from "antd/es/table";
import Image from "next/image";
import { EditOutlined } from "@ant-design/icons";

const BannerTable = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_BANNERS],
    queryFn: () => listBanners(),
  });

  const columns: ColumnsType<Banner> = [
    {
      title: "Bakgrund",
      key: "background",
      width: "120px",
      render: (_, { backgroundImage, presetBackground }) => (
        <div className="relative h-14 w-24 overflow-hidden rounded-md bg-neutral-100">
          {backgroundImage?.url ? (
            <Image
              src={backgroundImage.url}
              alt="Banner background"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              {presetBackground}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: "160px",
      ellipsis: true,
    },
    {
      title: "Titel",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Placeringar",
      dataIndex: "placements",
      key: "placements",
      width: "190px",
      render: (placements: string[]) => (
        <div className="flex flex-wrap gap-1">
          {placements.map((placement) => (
            <Tag key={placement}>{placement}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "URL / Action",
      key: "destination",
      width: "200px",
      ellipsis: true,
      render: (_, { url, action }) => {
        if (url) return <span className="text-xs text-neutral-500">{url}</span>;
        if (action) return <Tag>{action}</Tag>;
        return "-";
      },
    },
    {
      title: "Visningsperiod",
      key: "showPeriod",
      width: "200px",
      render: (_, { showFrom, showTo }) => {
        const now = new Date();
        const from = new Date(showFrom);
        const to = showTo ? new Date(showTo) : null;
        const isActive = from <= now && (!to || to >= now);
        return (
          <div className="flex flex-col gap-1">
            <Tag color={isActive ? "green" : "default"}>
              {isActive ? "Aktiv" : "Inaktiv"}
            </Tag>
            <span className="text-xs text-neutral-500">
              {formatDate(showFrom)} –{" "}
              {showTo ? formatDate(showTo) : "Tills vidare"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Skapad",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "100px",
      render: (_, { createdAt }) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "Administrera",
      key: "action",
      width: "80px",
      fixed: "right",
      render: (_, banner) => (
        <Button
          type="dashed"
          size="middle"
          icon={<EditOutlined />}
          onClick={() => router.push(`${routes.EDIT_BANNER}/${banner.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla banners</Divider>
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

export default BannerTable;
