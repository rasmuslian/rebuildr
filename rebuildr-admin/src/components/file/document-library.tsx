"use client";

import React, { useCallback } from "react";
import { Button, App, Table, Divider, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useState } from "@/hooks/use-state";
import { listFiles } from "@/queries/file/list-files";
import { DeleteOutlined, CopyOutlined } from "@ant-design/icons";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { File, FileType } from "gql/graphql";
import { ColumnsType } from "antd/es/table";
import { deleteFile } from "@/queries/file/delete-file";
import SearchField from "@components/search-field";
import { debounce } from "lodash";

type StateType = {
  searchString: string;
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  searchString: "",
  pageSize: 16,
  page: 1,
};

const DocumentLibrary = () => {
  const [state, setState] = useState(initialState);
  const { pageSize, page, searchString } = state;
  const { notification, modal, message } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_DOCUMENTS, page, pageSize, searchString],
    queryFn: () =>
      listFiles({
        page: page - 1,
        pageSize,
        fileType: FileType.Document,
        searchString,
      }),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => {
      return await deleteFile(id);
    },
    onSuccess: () => {
      notification.success({
        message: "Hurra!",
        description: "Dokumentet har tagits bort.",
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_DOCUMENTS] });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Kunde inte radera dokumentet.",
      });
    },
  });

  const confirmDelete = (title: string, id: string) => {
    const modalInstance = modal.confirm({
      title: 'Säker på att du vill ta bort "' + title + '"?',
      content:
        "När du raderar dokumentet kommer den inte längre vara tillgänglig och kan inte återställas.",
      async onOk() {
        await mutateAsync(id);
        modalInstance.update({
          okButtonProps: {
            loading: isPending,
          },
        });
      },
      okText: "Radera",
      okButtonProps: {
        danger: true,
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

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Länken har kopierats!");
    } catch (err) {
      message.error("Det gick inte att kopiera länken");
    }
  };

  const columns: ColumnsType<File> = [
    {
      title: "Filnamn",
      dataIndex: "name",
      key: "name",
      render: (_, { name, url }) => {
        return (
          <a href={url} target="_blank">
            {name}
          </a>
        );
      },
    },
    {
      title: "Administrera",
      key: "action",
      width: "120px",
      render: (_, { id, name, url }) => {
        return (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="dashed"
              size="middle"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(name ?? "dokumentet", id)}
            />
            <Tooltip title="Kopiera länken">
              <Button
                type="dashed"
                size="middle"
                icon={<CopyOutlined />}
                onClick={() => copyLink(url)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Dokumentbibliotek</Divider>

      <SearchField
        placeholder="Sök på filnamn"
        defaultValue={searchString}
        onChange={onSearchStringChange}
      />

      <Table
        columns={columns}
        dataSource={data?.files}
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
    </div>
  );
};

export default DocumentLibrary;
