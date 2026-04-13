"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { BannerSchema, BannerSchemaType } from "@/schema/banner-schema";
import { createBanner } from "@/queries/banner/create-banner";
import { CmsCreateBannerInput } from "gql/graphql";
import BannerForm from "@components/banner/banner-form";
import { getFileInputTypes, uploadFiles } from "@/utils/file-utils";
import { queryKeys } from "@/lib/query-keys";

const CreateBanner = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerSchemaType>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      label: "",
      title: "",
      presetBackground: "REBUILDR",
      backgroundImage: [],
      destinationType: "none",
      url: "",
      showFrom: dayjs(),
      showTo: undefined,
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateBannerInput) => {
      const response = await createBanner(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_BANNERS] });
      notification.success({
        message: "Hurra!",
        description: "Bannern har skapats.",
      });
      router.push(routes.LIST_BANNER);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Bannern kunde inte skapas.",
      });
    },
  });

  const buildInput = (formData: BannerSchemaType): CmsCreateBannerInput => ({
    label: formData.label,
    title: formData.title,
    presetBackground: formData.presetBackground as CmsCreateBannerInput["presetBackground"],
    backgroundImage:
      formData.backgroundImage?.length
        ? getFileInputTypes(formData.backgroundImage)[0]
        : undefined,
    url: formData.destinationType === "url" ? formData.url : undefined,
    action:
      formData.destinationType === "action"
        ? (formData.action as CmsCreateBannerInput["action"])
        : undefined,
    showFrom: formData.showFrom.toDate(),
    showTo: formData.showTo ? formData.showTo.toDate() : undefined,
  });

  const onSubmit = async (formData: BannerSchemaType) => {
    const response = await mutateAsync(buildInput(formData));

    if (response?.imagePutUrl) {
      await uploadFiles([response.imagePutUrl], formData.backgroundImage ?? []);
    }
  };

  return (
    <BannerForm
      title="Skapa banner"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Skapa"
    />
  );
};

export default CreateBanner;
