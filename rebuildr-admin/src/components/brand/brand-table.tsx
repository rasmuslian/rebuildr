"use client";

import React, { useCallback, useMemo, useState } from "react";
import { App, Button, Divider, Modal, Table } from "antd";
import { useState as useSharedState } from "@/hooks/use-state";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Brand } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { routes } from "@/lib/routes";
import { formatDate } from "@/utils/date-utils";
import { listBrands } from "@/queries/brand/list-brands";
import { deleteBrand } from "@/queries/brand/delete-brand";
import { debounce } from "lodash";
import SearchField from "@components/search-field";
import SelectBrand from "@components/brand/select-brand";
import { canDeleteBrand } from "@/queries/brand/can-delete-brand";
import { reassignBrand } from "@/queries/brand/reassign-brand";

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

const BrandTable = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [state, setState] = useSharedState(initialState);
  const { pageSize, page, searchString } = state;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [replacementBrandId, setReplacementBrandId] = useState<string>();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_BRAND, page, pageSize, searchString],
    queryFn: () => listBrands({ page: page - 1, pageSize, searchString }),
  });

  const { data: brandData, isLoading: brandDataLoading } = useQuery({
    queryKey: [queryKeys.CAN_DELETE_BRAND, selectedBrand?.id],
    queryFn: () =>
      selectedBrand
        ? canDeleteBrand(selectedBrand.id)
        : Promise.resolve({ canDelete: false }),
    enabled: !!selectedBrand,
  });

  const canDeleteWithoutReassign = !!brandData?.canDelete;

  const availableReplacementBrands = useMemo(
    () =>
      (data?.brands ?? []).filter((brand) => brand.id !== selectedBrand?.id),
    [data?.brands, selectedBrand?.id],
  );

  const { mutateAsync: _reassignBrand, isPending: isReassigning } = useMutation(
    {
      mutationFn: async ({ toBrandId }: { toBrandId: string }) => {
        if (!selectedBrand) return;
        await reassignBrand({
          fromBrandId: selectedBrand.id,
          toBrandId,
        });
      },
    },
  );

  const { mutateAsync: onDeleteBrand, isPending: isDeleting } = useMutation({
    mutationFn: async (brandId: string) => {
      const response = await deleteBrand({ id: brandId });
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_BRAND] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Hurra!",
        description: "Varumärket har tagits bort.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Varumärket kunde inte tas bort.",
      });
    },
  });

  const openDeleteModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setReplacementBrandId(undefined);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBrand || !brandData) return;

    //If we cannot delete brand, we have to reassign the brand to another brand
    if (!brandData.canDelete) {
      if (!replacementBrandId) return;
      const result = await reassignBrand({
        fromBrandId: selectedBrand.id,
        toBrandId: replacementBrandId,
      });
      if (!result?.fromBrand.canDelete) {
        notification.error({
          message: "Tyvärr!",
          description: "Något gick fel vid koppling till nytt varumärke",
        });
        return;
      }
    }

    await onDeleteBrand(selectedBrand.id);
    setIsDeleteOpen(false);
  };

  const onSearchStringChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ searchString: event.target.value, page: initialState.page });
    }, 400),
    [],
  );

  const columns: ColumnsType<Brand> = [
    {
      title: "Namn",
      dataIndex: "name",
      key: "name",
      width: "100%",
      ellipsis: true,
    },
    {
      title: "Skapad av",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "260px",
      ellipsis: true,
      render: (_, { createdBy }) => <span>{createdBy?.email ?? "-"}</span>,
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
      title: "Uppdaterad",
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
      render: (_, brand) => (
        <div className="flex flex-row items-center justify-center gap-4">
          <Button
            type="dashed"
            size="middle"
            icon={<EditOutlined />}
            onClick={() => router.push(`${routes.EDIT_BRAND}/${brand.id}`)}
          />
          <Button
            type="dashed"
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(brand)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Alla varumärken</Divider>

      <SearchField
        placeholder="Sök på namn"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.brands}
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

      <Modal
        open={isDeleteOpen}
        title="Ta bort varumärke"
        okText={
          canDeleteWithoutReassign ? "Ta bort" : "Byt varumärke och ta bort"
        }
        okButtonProps={{
          danger: true,
          disabled:
            (!canDeleteWithoutReassign && !replacementBrandId) ||
            (!canDeleteWithoutReassign &&
              availableReplacementBrands.length === 0),
          loading: isDeleting || isReassigning,
        }}
        cancelText="Avbryt"
        onCancel={() => setIsDeleteOpen(false)}
        onOk={handleDelete}
      >
        {selectedBrand && (
          <div className="flex flex-col gap-4">
            <p>
              Varumärket &quot;{selectedBrand.name}&quot; är kopplat till
              befintliga annonser.
            </p>
            {!canDeleteWithoutReassign && (
              <div className="flex flex-col gap-2">
                <p>Välj nytt varumärke för dessa annonser innan borttagning.</p>
                <SelectBrand
                  value={replacementBrandId}
                  onChange={(value) =>
                    value === selectedBrand.id
                      ? setReplacementBrandId(undefined)
                      : setReplacementBrandId(value)
                  }
                />
                {availableReplacementBrands.length === 0 && (
                  <p className="text-semantic_error_600">
                    Du måste skapa ett nytt varumärke innan du kan ta bort
                    detta.
                  </p>
                )}
              </div>
            )}
            {brandDataLoading && <p>Laddar...</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrandTable;
