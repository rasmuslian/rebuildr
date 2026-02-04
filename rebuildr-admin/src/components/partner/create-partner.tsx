"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { PartnerSchema, PartnerSchemaType } from "@/schema/partner-schema";
import { createPartner } from "@/queries/partner/create-partner";
import { CmsCreatePartnerInput } from "gql/graphql";
import PartnerForm from "@components/partner/partner-form";
import { getFileInputTypes, uploadFiles } from "@/utils/file-utils";
import { revalidate } from "@/actions/revalidate";

const CreatePartner = () => {
  const { notification } = App.useApp();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerSchemaType>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      logo: [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreatePartnerInput) => {
      const response = await createPartner(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      notification.success({
        message: "Hurra!",
        description: "Partnern har skapats.",
      });
      await revalidate(`${routes.LIST_PARTNER}`);
      router.push(routes.LIST_PARTNER);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Partnern kunde inte skapas.",
      });
    },
  });

  const buildInput = (formData: PartnerSchemaType): CmsCreatePartnerInput => ({
    name: formData.name,
    description: formData.description,
    websiteUrl: formData.websiteUrl ?? null,
    logo: getFileInputTypes(formData.logo)[0],
  });

  const onSubmit = async (formData: PartnerSchemaType) => {
    const response = await mutateAsync(buildInput(formData));

    if (response?.imagePutUrl) {
      await uploadFiles([response.imagePutUrl], formData.logo);
    }
  };

  return (
    <PartnerForm
      title="Skapa partner"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Skapa"
    />
  );
};

export default CreatePartner;
