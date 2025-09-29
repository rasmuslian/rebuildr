"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listFooterSections } from "@/queries/footer/list-footer-section";
import { Divider } from "antd";
import EmptyContainer from "@components/empty-container";
import FooerSectionItem from "./footer-section-item";

const ListFooterSections = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.LIST_FOOTER_SECTIONS],
    queryFn: () => listFooterSections(),
  });

  const footerSections = data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <Divider orientation="left">Nuvarande sektioner</Divider>

      {isLoading ? (
        <EmptyContainer spinner={isLoading} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {footerSections.map((footerSection) => (
            <FooerSectionItem
              key={footerSection.id}
              footerSection={footerSection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListFooterSections;
