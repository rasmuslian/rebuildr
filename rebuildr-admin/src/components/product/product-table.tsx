"use client";

import React, { useCallback } from "react";
import { Table, Divider, Tag, Button, App, Input } from "antd";
import { useState } from "@/hooks/use-state";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Product, ProductStatusEnum } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { listProducts } from "@/queries/product/list-products";
import SearchField from "@components/search-field";
import { debounce, isEmpty } from "lodash";
import { formatPrice } from "@/utils/price-utils";
import { conditions } from "@/constants/conditions";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { deleteProduct } from "@/queries/product/delete-product";
import { hideProduct } from "@/queries/product/hide-product";
import { unhideProduct } from "@/queries/product/unhide-product";
import FormField from "@components/form-field";

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

const ProductTable = () => {
  const [state, setState] = useState(initialState);
  const { searchString, pageSize, page } = state;
  const router = useRouter();
  const { modal, notification } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_PRODUCTS, page, pageSize, searchString],
    queryFn: () => listProducts({ page: page - 1, pageSize, searchString }),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (productId: string) => {
      const response = await deleteProduct(productId);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Produkten har raderats",
        description:
          "Produkten har tagits bort och är inte längre synlig för andra användare.",
      });
    },
    onError: () => {
      notification.error({
        message: "Raderingen misslyckades",
        description: "Produkten kunde tyvärr inte raderas. Försök igen senare.",
      });
    },
  });

  const { mutateAsync: hideMutation, isPending: isHiding } = useMutation({
    mutationFn: async ({
      productId,
      hiddenReason,
    }: {
      productId: string;
      hiddenReason: string;
    }) => {
      const response = await hideProduct(productId, hiddenReason);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Produkten har dolts",
        description:
          "Produkten är nu dold och syns inte längre för andra användare.",
      });
    },
    onError: () => {
      notification.error({
        message: "Åtgärden misslyckades",
        description: "Produkten kunde tyvärr inte döljas.",
      });
    },
  });

  const { mutateAsync: unhideMutation, isPending: isUnhiding } = useMutation({
    mutationFn: async (productId: string) => {
      const response = await unhideProduct(productId);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Produkten är synlig igen",
        description: "Produkten är nu synlig igen.",
      });
    },
    onError: () => {
      notification.error({
        message: "Åtgärden misslyckades",
        description: "Produkten kunde tyvärr inte visas igen.",
      });
    },
  });

  const confirmDelete = (title: string, id: string) => {
    modal.confirm({
      title: 'Säker på att du vill ta bort "' + title + '"?',
      content:
        "Om du raderar produkten kommer alla tillhörande bilder och dokument att tas bort permanent.",
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

  const confirmHide = (title: string, id: string) => {
    let hiddenReason = "";

    const modalInstance = modal.confirm({
      width: 700,
      title: 'Säker på att du vill dölja "' + title + '"?',
      content: (
        <div className="mb-6 flex flex-col gap-5">
          <p>När du döljer produkten kommer den inte längre vara synlig.</p>

          <FormField label="Döljningsorsak" required={true}>
            <Input.TextArea
              placeholder="Ange orsaken..."
              rows={8}
              showCount
              size="middle"
              maxLength={300}
              onChange={(e) => {
                hiddenReason = e.target.value.trim();
                modalInstance.update({
                  okButtonProps: {
                    disabled: hiddenReason.length === 0,
                  },
                });
              }}
            />
          </FormField>
        </div>
      ),
      async onOk() {
        await hideMutation({ productId: id, hiddenReason });
      },
      okText: "Dölj",
      okButtonProps: {
        loading: isHiding,
        disabled: true,
      },
      cancelText: "Avbryt",
    });
  };

  const confirmUnHide = (title: string, id: string, hiddenReason: string) => {
    modal.confirm({
      width: 700,
      title: 'Säker på att du vill visa "' + title + '" igen?',
      content: (
        <div className="mb-6 flex flex-col gap-5">
          <p>När du visar produkten kommer den bli synlig igen.</p>

          <FormField label="Döljningsorsak" required={true}>
            <Input.TextArea
              placeholder="Ange orsaken..."
              rows={8}
              value={hiddenReason}
              disabled
              showCount
              size="middle"
              maxLength={300}
            />
          </FormField>
        </div>
      ),
      async onOk() {
        await unhideMutation(id);
      },
      okText: "Visa",
      okButtonProps: {
        loading: isUnhiding,
      },
      cancelText: "Avbryt",
    });
  };

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const getProductStatusTag = (status: ProductStatusEnum) => {
    switch (status) {
      case ProductStatusEnum.Published:
        return <Tag color={"default"}>Publicerad</Tag>;
      case ProductStatusEnum.Sold:
        return <Tag color={"green"}>Såld</Tag>;
      case ProductStatusEnum.Deleted:
        return <Tag color={"error"}>Raderad</Tag>;
      case ProductStatusEnum.Draft:
        return <Tag color={"yellow"}>Draft</Tag>;
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Rubrik",
      dataIndex: "title",
      key: "title",
      width: "300px",
      ellipsis: true,
    },
    {
      title: "Säljare",
      key: "seller",
      width: "180px",
      ellipsis: true,
      render: (_, { seller }) => <span>{seller.username}</span>,
    },
    {
      title: "Säljarens email",
      key: "sellerEmail",
      dataIndex: "sellerEmail",
      width: "300px",
      ellipsis: true,
      render: (_, { seller }) => <span>{seller.email}</span>,
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      width: "200px",
      ellipsis: true,
      render: (_, { category }) => <span>{category?.name}</span>,
    },
    {
      title: "Varumärke",
      dataIndex: "brand",
      key: "brand",
      width: "150px",
      ellipsis: true,
      render: (_, { brand }) => <span>{brand?.name}</span>,
    },
    {
      title: "Skick",
      dataIndex: "condition",
      key: "condition",
      width: "150px",
      ellipsis: true,
      render: (_, { condition }) => <span>{conditions[condition].name}</span>,
    },
    {
      title: "Pris",
      key: "priceInKr",
      dataIndex: "priceInKr",
      width: "100px",
      ellipsis: true,
      render: (_, { price }) => <span>{formatPrice(price)}</span>,
    },
    {
      title: "Status",
      key: "status",
      width: "150px",
      ellipsis: true,
      render: (_, { status }) => {
        return getProductStatusTag(status);
      },
    },
    {
      title: "Administrera",
      key: "action",
      width: "120px",
      render: (_, { title, id, status, hiddenReason }) => {
        const isPublished = status === ProductStatusEnum.Published;
        const isHidden = !isEmpty(hiddenReason);

        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<EditOutlined />}
              onClick={() => router.push(`${routes.EDIT_PRODUCT}/${id}`)}
            />
            <Button
              type="dashed"
              size="middle"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(title, id)}
              disabled={!isPublished}
            />
            <Button
              type="dashed"
              danger={isHidden}
              size="middle"
              icon={isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => {
                if (isHidden) {
                  confirmUnHide(title, id, hiddenReason ?? "");
                } else {
                  confirmHide(title, id);
                }
              }}
              disabled={!isPublished}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla produkter</Divider>

      <SearchField
        placeholder="Sök på rubrik, säljare, säljarens email eller kategori"
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

export default ProductTable;
