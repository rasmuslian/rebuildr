import React from "react";
import { Pagination, Image, Button, App } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useState } from "@/hooks/use-state";
import { listMedia } from "@/queries/media/list-media";
import EmptyContainer from "@components/empty-container";
import { isEmpty } from "lodash";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteMedia } from "@/queries/media/delete-media";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 16,
  page: 0,
};

type Props = {
  onSelectImage?: (source: string) => void;
};

const ListMedia = ({ onSelectImage }: Props) => {
  const [state, setState] = useState(initialState);
  const { pageSize, page } = state;
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const canPreview = onSelectImage ? false : true;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_IMAGES, page, pageSize],
    queryFn: () => listMedia({ page, pageSize }),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (imageId: string) => {
      return await deleteMedia(imageId);
    },
    onSuccess: () => {
      notification.success({
        message: "Hurra!",
        description: "Bilden har tagits bort.",
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_IMAGES] });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Kunde inte radera bilden.",
      });
    },
  });

  const onDownload = (url: string) => {
    const suffix = url.slice(url.lastIndexOf("."));
    const filename = Date.now() + suffix;

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(blobUrl);
        link.remove();
      });
  };

  const files = data?.files ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-5 pb-5">
      {isEmpty(files) ? (
        <EmptyContainer
          spinner={isLoading}
          description="Inga bilder hittades"
        />
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {files.map((file) => (
            <Image
              key={file.id}
              src={file.url}
              width={"100%"}
              height={200}
              style={{ objectFit: "cover" }}
              alt={file.name ?? ""}
              onClick={() => {
                if (onSelectImage) {
                  onSelectImage(file.url);
                }
              }}
              preview={
                canPreview
                  ? {
                      toolbarRender: (_, { actions: { onClose } }) => (
                        <div className="flex flex-row gap-5">
                          <Button
                            icon={<DeleteOutlined />}
                            loading={isPending}
                            disabled={isPending}
                            size="middle"
                            onClick={async () => {
                              const result = await mutateAsync(file.id);
                              if (result) onClose();
                            }}
                          >
                            Radera bilden
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            size="middle"
                            onClick={() => onDownload(file.url)}
                          >
                            Ladda ner bilden
                          </Button>
                        </div>
                      ),
                    }
                  : false
              }
            />
          ))}
        </div>
      )}

      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(page) => setState({ page: page })}
        pageSizeOptions={[16, 24, 32, 40]}
        onShowSizeChange={(_, size) => setState({ pageSize: size })}
        style={{ display: "flex", justifyContent: "flex-end" }}
      />
    </div>
  );
};

export default ListMedia;
