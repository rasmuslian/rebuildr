"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getUserProjects } from "@/queries/project/get-user-projects";
import { Select, SelectProps } from "antd";
import EmptyContainer from "@/components/empty-container";

type Props = {
  sellerId?: string;
  projectId?: string;
  disabled?: boolean;
  onSelectProject: (projectId: string) => void;
};

const SelectProject = ({
  sellerId,
  projectId,
  disabled = false,
  onSelectProject,
}: Props) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [queryKeys.LIST_USER_PROJECTS, sellerId],
    queryFn: () => getUserProjects(sellerId),
    enabled: !disabled,
  });

  const options: SelectProps["options"] = useMemo(
    () =>
      projects.map((project) => ({
        label: project.title,
        value: project.id,
      })),
    [projects],
  );

  return (
    <Select
      showSearch
      disabled={disabled}
      loading={isLoading}
      optionFilterProp="label"
      placeholder="Välj projekt ..."
      value={projectId}
      options={options}
      onChange={onSelectProject}
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

export default SelectProject;
