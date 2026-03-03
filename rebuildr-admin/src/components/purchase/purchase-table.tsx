"use client";

import React from "react";
import { debounce } from "lodash";
import SearchField from "@/components/search-field";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { listPurchases } from "@/queries/purchase/list-purchases";
import { ColumnsType } from "antd/es/table";
import { Purchase, PurchaseStatusEnum } from "gql/graphql";
import { Table, Tag, Divider, Select } from "antd";
import { formatPrice } from "@/utils/price-utils";
import { formatDate } from "@/utils/date-utils";
import { usePersistedState } from "@/hooks/use-persisted-state";

type StateType = {
  searchString: string;
  pageSize: number;
  page: number;
  status?: PurchaseStatusEnum;
};

const initialState: StateType = {
  searchString: "",
  pageSize: 10,
  page: 1,
  status: undefined,
};

const PurchaseTable = () => {
  const [state, setState] = usePersistedState("list-purchases", initialState);
  const { searchString, pageSize, page, status } = state;

  const { data, isLoading, isFetched } = useQuery({
    queryKey: [queryKeys.LIST_PURCHASES, page, pageSize, searchString, status],
    queryFn: () =>
      listPurchases({
        page: page - 1,
        pageSize,
        searchString,
        status,
      }),
  });

  const onSearchStringChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    },
    400,
  );

  const withGroupColor = (group: "a" | "b") => {
    let color = "";
    switch (group) {
      case "a":
        color = "#FFF8E6";
        break;

      case "b":
        color = "#F5F8FF";
        break;

      default:
        color = "tranparent";
        break;
    }

    return {
      onHeaderCell: () => ({ style: { backgroundColor: color } }),
      onCell: () => ({ style: { backgroundColor: color } }),
    };
  };

  const columns: ColumnsType<Purchase> = [
    {
      title: "Order id",
      dataIndex: "id",
      key: "id",
      width: "350px",
    },
    {
      title: "Säljare",
      key: "seller",
      width: "25%",
      ...withGroupColor("a"),
      children: [
        {
          title: "Id",
          key: "id",
          width: "350px",
          ...withGroupColor("a"),
          render: (_, { product }) => <span>{product.seller.id}</span>,
        },
        {
          title: "Namn",
          key: "namn",
          width: "170px",
          ellipsis: true,
          ...withGroupColor("a"),
          render: (_, { product }) => <span>{product.seller.username}</span>,
        },
        {
          title: "E-post",
          key: "email",
          width: "170px",
          ellipsis: true,
          ...withGroupColor("a"),
          render: (_, { product }) => <span>{product.seller.email}</span>,
        },
      ],
    },
    {
      title: "Köpare",
      key: "buyer",
      ...withGroupColor("b"),
      children: [
        {
          title: "Id",
          key: "id",
          width: "350px",
          ...withGroupColor("b"),
          render: (_, { buyer }) => <span>{buyer.id}</span>,
        },
        {
          title: "Namn",
          key: "namn",
          width: "170px",
          ellipsis: true,
          ...withGroupColor("b"),
          render: (_, { buyer }) => <span>{buyer.username}</span>,
        },
        {
          title: "E-post",
          key: "email",
          width: "170px",
          ellipsis: true,
          ...withGroupColor("b"),
          render: (_, { buyer }) => <span>{buyer.email}</span>,
        },
      ],
    },
    {
      title: "Produkt",
      key: "product",
      ...withGroupColor("a"),
      children: [
        {
          title: "Id",
          key: "id",
          width: "350px",
          ...withGroupColor("a"),
          render: (_, { product: { id } }) => <span>{id}</span>,
        },
        {
          title: "Titel",
          key: "title",
          width: "200px",
          ellipsis: true,
          ...withGroupColor("a"),
          render: (_, { product: { title } }) => <span>{title}</span>,
        },
        {
          title: "Pris",
          key: "price",
          width: "180px",
          ...withGroupColor("a"),
          render: (_, { product: { price } }) => (
            <span>{formatPrice(price)}</span>
          ),
        },
      ],
    },
    {
      title: "Datum",
      key: "date",
      ...withGroupColor("b"),
      children: [
        {
          title: "Betalning mottagen",
          key: "paymentAcceptedAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { paymentAcceptedAt }) => (
            <span>{formatDate(paymentAcceptedAt)}</span>
          ),
        },
        {
          title: "Frakt bokad",
          key: "shipmentBookedAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { shipmentBookedAt }) => (
            <span>{formatDate(shipmentBookedAt)}</span>
          ),
        },
        {
          title: "Paket inlämnat",
          key: "shipmentDroppedOffAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { shipmentDroppedOffAt }) => (
            <span>{formatDate(shipmentDroppedOffAt)}</span>
          ),
        },
        {
          title: "Paket levererat",
          key: "deliveredAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { deliveredAt }) => (
            <span>{formatDate(deliveredAt)}</span>
          ),
        },
        {
          title: "Köp pausat",
          key: "pausedAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { pausedAt }) => <span>{formatDate(pausedAt)}</span>,
        },
        {
          title: "Pengar utbetalda",
          key: "payoutReceivedAt",
          width: "180px",
          ...withGroupColor("b"),
          render: (_, { payoutReceivedAt }) => (
            <span>{formatDate(payoutReceivedAt)}</span>
          ),
        },
      ],
    },
    {
      title: () => (
        <Select
          style={{ width: "250px" }}
          placeholder="Filter med status"
          loading={isLoading}
          value={isFetched ? status : undefined}
          allowClear
          options={[
            {
              value: PurchaseStatusEnum.PaymentAccepted,
              label: "Betalning mottagen",
            },
            {
              value: PurchaseStatusEnum.ShipmentBooked,
              label: "Frakt bokad",
            },
            {
              value: PurchaseStatusEnum.ShipmentDroppedOff,
              label: "Paketet har lämnats in",
            },
            {
              value: PurchaseStatusEnum.ShippingDelivered,
              label: "Paket levererat till ombud",
            },
            {
              value: PurchaseStatusEnum.Delivered,
              label: "Paket uthämtat från ombud",
            },
            {
              value: PurchaseStatusEnum.Paused,
              label: "Köp pausat",
            },
            {
              value: PurchaseStatusEnum.FinishedFailed,
              label: "Köp avbrutet",
            },
            {
              value: PurchaseStatusEnum.FinishedSuccess,
              label: "Pengarna har utbetalats",
            },
            {
              value: PurchaseStatusEnum.Approved,
              label: "Produkten har bekräftats",
            },
          ]}
          onChange={(status) => setState({ status, page: initialState.page })}
        />
      ),
      key: "status",
      fixed: "right",
      width: "240px",
      render: (_, { status }) => {
        switch (status) {
          case PurchaseStatusEnum.PaymentAccepted:
            return <Tag color={"green"}>Betalning mottagen</Tag>;
          case PurchaseStatusEnum.ShipmentBooked:
            return <Tag color={"processing"}>Frakt bokad</Tag>;
          case PurchaseStatusEnum.ShipmentDroppedOff:
            return <Tag color={"green"}>Paketet har lämnats in</Tag>;
          case PurchaseStatusEnum.ShippingStarted:
            return <Tag color={"processing"}>Paket under transport</Tag>;
          case PurchaseStatusEnum.ShippingDelivered:
            return <Tag color={"processing"}>Paket levererat till ombud</Tag>;
          case PurchaseStatusEnum.Delivered:
            return <Tag color={"green"}>Paket uthämtat från ombud</Tag>;
          case PurchaseStatusEnum.PayoutFailed:
            return <Tag color={"red-inverse"}>Utbetalning misslyckades</Tag>;
          case PurchaseStatusEnum.FinishedFailed:
            return <Tag color={"red-inverse"}>Köp avbrutet</Tag>;
          case PurchaseStatusEnum.Paused:
            return <Tag color={"orange"}>Köp pausat</Tag>;
          case PurchaseStatusEnum.FinishedSuccess:
            return <Tag color={"green-inverse"}>Pengarna har utbetalats</Tag>;
          case PurchaseStatusEnum.Approved:
            return <Tag color={"purple-inverse"}>Produkten har bekräftats</Tag>;
          default:
            return <Tag color={"default"}>Bearbetas</Tag>;
        }
      },
    },
  ];

  return (
    <div className="flex w-full min-w-[800px] flex-col gap-5">
      <Divider orientation="start">
        <h3>Alla ordrar</h3>
      </Divider>

      <SearchField
        placeholder="Sök på produkt titel, säljare eller köpare"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.purchases}
        bordered
        loading={isLoading}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total,
          onChange: (page) => setState({ page }),
          pageSizeOptions: [10, 20, 35, 50, data?.total || 1000],
          onShowSizeChange: (_, size) => setState({ pageSize: size }),
        }}
      />
    </div>
  );
};

export default PurchaseTable;
