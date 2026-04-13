"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { Banner, CmsUpdateBannerInput } from "gql/graphql";
import { BannerSchema, BannerSchemaType } from "@/schema/banner-schema";
import BannerForm from "@components/banner/banner-form";
import { updateBanner } from "@/queries/banner/update-banner";
import {
  getFileInputTypes,
  getUploadFiles,
  uploadFiles,
} from "@/utils/file-utils";
import { queryKeys } from "@/lib/query-keys";
import { routes } from "@/lib/routes";

type Props = {
  banner: Banner;
};

const getDestinationType = (banner: Banner): "none" | "url" | "action" => {
  if (banner.url) return "url";
  if (banner.action) return "action";
  return "none";
};

const EditBanner = ({ banner }: Props) => {
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
      label: banner.label,
      title: banner.title,
      presetBackground:
        (banner.presetBackground as BannerSchemaType["presetBackground"]) ??
        "REBUILDR",
      backgroundImage: banner.backgroundImage
        ? getUploadFiles([banner.backgroundImage])
        : [],
      destinationType: getDestinationType(banner),
      url: banner.url ?? "",
      action: (banner.action as BannerSchemaType["action"]) ?? undefined,
      active: banner.active,
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateBannerInput) => {
      const response = await updateBanner(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_BANNERS] });
      notification.success({
        message: "Hurra!",
        description: "Bannern har uppdaterats.",
      });
      router.push(routes.LIST_BANNER);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Bannern kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: BannerSchemaType) => {
    const backgroundImageInput = getFileInputTypes(
      formData.backgroundImage ?? [],
    )[0];

    const input: CmsUpdateBannerInput = {
      id: banner.id,
      label: formData.label,
      title: formData.title,
      presetBackground:
        formData.presetBackground as CmsUpdateBannerInput["presetBackground"],
      url: formData.destinationType === "url" ? formData.url : undefined,
      action:
        formData.destinationType === "action"
          ? (formData.action as CmsUpdateBannerInput["action"])
          : undefined,
      active: formData.active,
      ...(backgroundImageInput ? { backgroundImage: backgroundImageInput } : {}),
    };

    const response = await mutateAsync(input);

    if (response?.imagePutUrl && backgroundImageInput) {
      await uploadFiles([response.imagePutUrl], formData.backgroundImage ?? []);
    }
  };

  return (
    <BannerForm
      title="Redigera banner"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Spara"
    />
  );
};

export default EditBanner;
