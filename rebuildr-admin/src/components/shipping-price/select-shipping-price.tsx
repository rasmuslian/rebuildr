"use client";

import React, { useMemo } from "react";
import EmptyContainer from "@/components/empty-container";
import { Select, SelectProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listShippingPrices } from "@/queries/shipping/list-shipping-prices";
import { ShippingProviderEnum } from "gql/graphql";

type Props = {
  value?: string;
  onChange: (brandId: string) => void;
};

const SelectShippingPrice = ({ value, onChange }: Props) => {
  const { data: shippingPrices = [], isLoading } = useQuery({
    queryKey: [queryKeys.LIST_SHIPPING_PRICE],
    queryFn: () => listShippingPrices(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      shippingPrices
        .filter((shippingPrice) => {
          return shippingPrice.provider === ShippingProviderEnum.Postnord;
        })
        .map((shippingPrice) => ({
          label: (
            <div className="flex flex-row justify-between">
              <span>Max {shippingPrice.maxWeight} kg</span>
              <span>{shippingPrice.price} kr</span>
            </div>
          ),
          value: shippingPrice.id,
        })),
    [shippingPrices],
  );

  return (
    <Select
      showSearch
      loading={isLoading}
      optionFilterProp="label"
      placeholder="Välj vikt på paketet ..."
      value={isLoading ? undefined : value}
      options={options}
      onChange={onChange}
      notFoundContent={
        <EmptyContainer
          description={"Kunde inte hitta"}
          size="small"
          spinner={isLoading}
        />
      }
    />
  );
};

export default SelectShippingPrice;
