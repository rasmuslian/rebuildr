"use client";

import React from "react";
import ProjectForm from "@components/project/project-form";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ProjectSchema, ProjectSchemaType } from "@/schema/project-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CmsUpdateProjectInput, Project } from "gql/graphql";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { revalidate } from "@/actions/revalidate";
import { updateProject } from "@/queries/project/update-project";
import { queryKeys } from "@/lib/query-keys";

type Props = {
  project: Project;
};

const EditProject = ({ project }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description ?? "",
      address: project.address,
      contact: {
        name: project.contactName ?? "",
        email: project.contactEmail ?? "",
        phone: project.contactPhone ?? "",
      },
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateProjectInput) => {
      const response = await updateProject(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PROJECTS] });
      notification.success({
        message: "Hurra!",
        description: "Projekten har uppdaterats.",
      });
      await revalidate(`${routes.EDIT_PROJECT}/${project.id}`);
      router.push(routes.LIST_PROJECT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Projekten kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: ProjectSchemaType) => {
    const updatedProject: CmsUpdateProjectInput = {
      id: project.id,
      title: formData.title,
      description: formData.description,
      address: formData.address,
      contactName: formData.contact.name || null,
      contactEmail: formData.contact.email || null,
      contactPhone: formData.contact.phone || null,
    };

    mutateAsync(updatedProject);
  };

  return (
    <ProjectForm
      title="Redigera project"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="Spara"
    />
  );
};

export default EditProject;
