"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import dayjs from "dayjs";
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
      label: banner.label ?? "",
      title: banner.title,
      presetBackground:
        (banner.presetBackground as BannerSchemaType["presetBackground"]) ??
        "REBUILDR",
      backgroundImage: banner.backgroundImage
        ? getUploadFiles([banner.backgroundImage])
        : [],
      logo: banner.logo ? getUploadFiles([banner.logo]) : [],
      placements: banner.placements as BannerSchemaType["placements"],
      ctaText: banner.ctaText ?? "",
      destinationType: getDestinationType(banner),
      url: banner.url ?? "",
      action: (banner.action as BannerSchemaType["action"]) ?? undefined,
      showFrom: dayjs(banner.showFrom),
      showTo: banner.showTo ? dayjs(banner.showTo) : undefined,
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
    const logoInput = getFileInputTypes(formData.logo ?? [])[0];

    const input: CmsUpdateBannerInput = {
      id: banner.id,
      label: formData.label || null,
      title: formData.title,
      presetBackground:
        formData.presetBackground as CmsUpdateBannerInput["presetBackground"],
      placements: formData.placements as CmsUpdateBannerInput["placements"],
      ctaText: formData.ctaText || undefined,
      url: formData.destinationType === "url" ? formData.url : undefined,
      action:
        formData.destinationType === "action"
          ? (formData.action as CmsUpdateBannerInput["action"])
          : undefined,
      showFrom: formData.showFrom.toDate(),
      showTo: formData.showTo ? formData.showTo.toDate() : undefined,
      ...(backgroundImageInput
        ? { backgroundImage: backgroundImageInput }
        : {}),
      ...(logoInput ? { logo: logoInput } : {}),
    };

    const response = await mutateAsync(input);

    if (response?.imagePutUrl && backgroundImageInput) {
      await uploadFiles([response.imagePutUrl], formData.backgroundImage ?? []);
    }
    if (response?.logoPutUrl && logoInput) {
      await uploadFiles([response.logoPutUrl], formData.logo ?? []);
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
