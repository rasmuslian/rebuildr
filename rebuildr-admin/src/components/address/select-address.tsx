"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";
import { queryKeys } from "@/lib/query-keys";
import { searchAddress } from "@/queries/geocoding/search-address";
import { debounce, isEmpty } from "lodash";

type Props = {
  value?: string;
  onChange: (address: string) => void;
  disabled?: boolean;
};

const SelectAddress = ({ value, onChange, disabled = false }: Props) => {
  const [searchString, setSearchString] = useState("");
  const { data: results = [], isLoading } = useQuery({
    queryKey: [queryKeys.SEARCH_ADDRESS, searchString],
    queryFn: () => searchAddress({ searchString }),
    enabled: !isEmpty(searchString),
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      results.map((result) => ({
        label: result,
        value: result,
      })),
    [results],
  );

  const onSearch = useCallback(
    debounce((value: string) => {
      setSearchString(value);
    }, 400),
    [],
  );

  return (
    <Select
      disabled={disabled}
      showSearch
      loading={isLoading}
      placeholder="Sök på adress ..."
      filterOption={false}
      options={options}
      value={value}
      onSearch={onSearch}
      onChange={onChange}
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

export default SelectAddress;
