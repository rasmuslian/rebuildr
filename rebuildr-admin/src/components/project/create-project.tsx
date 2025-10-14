"use client";

import React from "react";
import ProjectForm from "@components/project/project-form";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ProjectSchema, ProjectSchemaType } from "@/schema/project-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CmsCreateProjectInput } from "gql/graphql";
import { createProject } from "@/queries/project/create-project";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { App } from "antd";

const CreateProject = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateProjectInput) => {
      const response = await createProject(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PROJECTS] });
      notification.success({
        message: "Hurra!",
        description: "Projekten har skapats.",
      });

      router.push(routes.LIST_PROJECT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Projekten kunde inte skapas.",
      });
    },
  });

  const onSubmit = async (formData: ProjectSchemaType) => {
    const newProject: CmsCreateProjectInput = {
      title: formData.title,
      description: formData.description,
      address: formData.address,
      contactName: formData.contact.name || null,
      contactEmail: formData.contact.email || null,
      contactPhone: formData.contact.phone || null,
    };

    mutateAsync(newProject);
  };

  return (
    <ProjectForm
      title="Skapa project"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="Publicera"
    />
  );
};

export default CreateProject;
