"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { queryKeys } from "@/lib/query-keys";
import { searchAddress } from "@/queries/geocoding/search-address";
import { debounce, isEmpty } from "lodash";

type Props = {
  address: string;
  onSelectAddress: (address: string) => void;
};

const SearchAddress = ({ address, onSelectAddress }: Props) => {
  const [searchString, setSearchString] = useState("");
  const { data: result = [], isLoading } = useQuery({
    queryKey: [queryKeys.SEARCH_ADDRESS, searchString],
    queryFn: () => searchAddress({ searchString }),
    enabled: !isEmpty(searchString),
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      result.map((address) => ({
        label: address,
        value: address,
      })),
    [result],
  );

  const onSearch = useCallback(
    debounce((value: string) => {
      setSearchString(value);
    }, 400),
    [],
  );

  return (
    <Select
      showSearch
      loading={isLoading}
      placeholder="Sök på adress ..."
      filterOption={false}
      options={options}
      defaultValue={address}
      onSearch={onSearch}
      onSelect={onSelectAddress}
      notFoundContent={
        <EmptyContainer
          description={
            isEmpty(searchString) && !isLoading
              ? "Börja skriva för att söka adress..."
              : "Ingen adress hittades"
          }
          size="small"
          spinner={isLoading}
        />
      }
    />
  );
};

export default SearchAddress;
