"use client";

import React, { useEffect } from "react";
import ProjectForm from "@components/project/project-form";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { ProjectSchema, ProjectSchemaType } from "@/schema/project-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CmsCreateProjectInput } from "gql/graphql";
import { createProject } from "@/queries/project/create-project";
import { getProfile } from "@/queries/profile/get-profile";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { App } from "antd";

const CreateProject = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: [queryKeys.GET_PROFILE],
    queryFn: getProfile,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      showDetailsOnMap: false,
      shortText: "",
    },
  });

  useEffect(() => {
    if (profile?.id) {
      setValue("userId", profile.id);
    }
  }, [profile?.id]);

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
      showDetailsOnMap: formData.showDetailsOnMap,
      shortText: formData.shortText || null,
      contactName: formData.contact.name || null,
      contactEmail: formData.contact.email || null,
      contactPhone: formData.contact.phone || null,
      userId: formData.userId,
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
      sellerInitialLabel={profile?.email ?? profile?.username ?? undefined}
      sellerInitialPicture={profile?.profilePicture?.url ?? undefined}
    />
  );
};

export default CreateProject;
