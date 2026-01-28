"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BrandSchema, BrandSchemaType } from "@/schema/brand-schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CmsUpdateBrandInput, Brand } from "gql/graphql";
import { updateBrand } from "@/queries/brand/update-brand";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { App } from "antd";
import BrandForm from "./brand-form";
import { revalidate } from "@/actions/revalidate";

type Props = {
  brand: Brand;
};

const EditBrand = ({ brand }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandSchemaType>({
    resolver: zodResolver(BrandSchema),
    defaultValues: {
      name: brand.name,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand: CmsUpdateBrandInput) => {
      const response = await updateBrand(brand);
      const errorMessage = response.errors && response.errors[0].message;
      if (errorMessage) throw new Error(errorMessage);
      return response;
    },
    onSuccess: async () => {
      notification.success({
        message: "Hurra!",
        description: "Varumärket har uppdaterats.",
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_BRAND],
      });
      await revalidate(`${routes.EDIT_BRAND}/${brand.id}`);
      router.push(routes.LIST_BRAND);
    },
    onError: (error) => {
      notification.error({
        message: "Tyvärr!",
        description: error.message ?? "Varumärket kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: BrandSchemaType) => {
    const updatedBrand: CmsUpdateBrandInput = {
      id: brand.id,
      ...formData,
    };

    mutate(updatedBrand);
  };

  return (
    <BrandForm
      isPending={isPending}
      title="Redigera varumärket"
      submitLabel="Spara"
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      control={control}
      mode="edit"
    />
  );
};

export default EditBrand;
