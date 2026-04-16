"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectProps, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import EmptyContainer from "@/components/empty-container";
import { queryKeys } from "@/lib/query-keys";
import { listUsers } from "@/queries/user/list-users";
import { getUser } from "@/queries/user/get-user";
import { debounce } from "lodash";

const PAGE_SIZE = 10;

type Props = {
  label?: string;
  value?: string;
  initialLabel?: string;
  initialPicture?: string;
  onChange: (userId: string) => void;
};

const SelectUser = ({
  label,
  value,
  initialLabel,
  initialPicture,
  onChange,
}: Props) => {
  const [searchString, setSearchString] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>();

  const { data: selectedUser } = useQuery({
    queryKey: [queryKeys.GET_USER, value],
    queryFn: () => getUser(value!),
    enabled: !!value,
    staleTime: 1000 * 60 * 5,
  });

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: [queryKeys.LIST_USERS, searchString],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      console.log("pageParam :>> ", pageParam);
      return listUsers({
        searchString,
        pageSize: PAGE_SIZE,
        page: (pageParam as number) - 1,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      console.log("lastPage :>> ", lastPage);
      console.log("allPages :>> ", allPages);
      const fetched = allPages.reduce(
        (acc, page) => acc + (page.users?.length ?? 0),
        0,
      );
      if (!lastPage.total || fetched >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
    refetchOnWindowFocus: false,
  });

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.users ?? []) ?? [],
    [data],
  );

  const options: SelectProps["options"] = users.map((user) => ({
    label: user.email ? `${user.name} (${user.email})` : user.name,
    value: user.id,
  }));

  const onSearch = debounce((value: string) => {
    setSearchString(value);
  }, 400);

  const onPopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { offsetHeight, scrollHeight, scrollTop } = target;
    const isBottom = scrollTop + offsetHeight >= scrollHeight - 1;

    if (!isLoading && isBottom && hasNextPage) {
      fetchNextPage();
    }
  };

  const avatarSrc = selectedUser?.profilePicture?.url;
  const displayLabel =
    selectedLabel ??
    (selectedUser?.email
      ? `${selectedUser.name} (${selectedUser.email})`
      : selectedUser?.name) ??
    initialLabel ??
    value;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-label-large">{label}</label>}

      <div className="flex flex-row items-center gap-3 overflow-hidden">
        <Avatar size={40} icon={<UserOutlined />} src={avatarSrc} />

        <Select
          className="min-w-0 flex-1"
          placeholder="Sök efter användare ..."
          size="large"
          showSearch
          labelInValue
          loading={isLoading}
          options={options}
          allowClear={false}
          filterOption={false}
          value={value ? { label: displayLabel, value } : undefined}
          labelRender={({ label }) => (
            <span className="block truncate">{label}</span>
          )}
          optionRender={(option) => (
            <span className="block truncate">{option.label}</span>
          )}
          onSearch={onSearch}
          onPopupScroll={onPopupScroll}
          onSelect={({ label, value: userId }) => {
            setSelectedLabel(label as string);
            onChange(userId as string);
            setSearchString("");
          }}
          notFoundContent={
            <EmptyContainer
              description="Ingen användare hittades"
              size="small"
              spinner={isLoading}
            />
          }
        />
      </div>

      {selectedUser && selectedUser.sellerAccountIsEnabled === false && (
        <p className="text-body-small text-red-500">
          Denna säljare har ännu inte färdigställt sitt säljkonto
        </p>
      )}
    </div>
  );
};

export default SelectUser;
