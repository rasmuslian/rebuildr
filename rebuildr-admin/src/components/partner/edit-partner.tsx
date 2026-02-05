"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { Partner, CmsUpdatePartnerInput } from "gql/graphql";
import { PartnerSchema, PartnerSchemaType } from "@/schema/partner-schema";
import PartnerForm from "@components/partner/partner-form";
import { updatePartner } from "@/queries/partner/update-partner";
import { getFileInputTypes, getUploadFiles, uploadFiles } from "@/utils/file-utils";
import { queryKeys } from "@/lib/query-keys";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

type Props = {
  partner: Partner;
};

const EditPartner = ({ partner }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerSchemaType>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      name: partner.name,
      description: partner.description,
      websiteUrl: partner.websiteUrl ?? "",
      logo: getUploadFiles([partner.logo]),
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdatePartnerInput) => {
      const response = await updatePartner(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PARTNER] });
      notification.success({
        message: "Hurra!",
        description: "Partnern har uppdaterats.",
      });
      router.push(routes.LIST_PARTNER);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Partnern kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: PartnerSchemaType) => {
    const logoInput = getFileInputTypes(formData.logo)[0];
    const updateInput: CmsUpdatePartnerInput = {
      id: partner.id,
      name: formData.name,
      description: formData.description,
      websiteUrl: formData.websiteUrl ?? null,
      ...(logoInput ? { logo: logoInput } : {}),
    };

    const response = await mutateAsync(updateInput);

    if (response?.imagePutUrl && logoInput) {
      await uploadFiles([response.imagePutUrl], formData.logo);
    }
  };

  return (
    <PartnerForm
      title="Redigera partner"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Spara"
    />
  );
};

export default EditPartner;
