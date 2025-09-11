import React from "react";
import { Pagination, Image } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { listMedia } from "@/queries/media/list-media";
import EmptyContainer from "@components/empty-container";
import { isEmpty } from "lodash";

type StateType = {
  pageSize: number;
  page: number;
};

const initialState: StateType = {
  pageSize: 16,
  page: 0,
};

const ListMedia = () => {
  const [state, setState] = usePersistedState("list-media", initialState);
  const { pageSize, page } = state;

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_IMAGES, page, pageSize],
    queryFn: () => listMedia({ page, pageSize }),
  });

  const files = data?.files;
  const total = data?.total;

  return (
    <div className="flex flex-col gap-5 pb-5">
      {isEmpty(files) ? (
        <EmptyContainer
          spinner={isLoading}
          description="Inga bilder hittades"
        />
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {files?.map((file) => (
            <Image
              src={file.url}
              key={file.id}
              width={"100%"}
              height={200}
              style={{ objectFit: "cover" }}
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
