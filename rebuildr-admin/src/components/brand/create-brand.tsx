"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BrandSchema, BrandSchemaType } from "@/schema/brand-schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CmsCreateBrandInput } from "gql/graphql";
import { createBrand } from "@/queries/brand/create-brand";
import BrandForm from "@components/brand/brand-form";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { App } from "antd";

const CreateBrand = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandSchemaType>({
    resolver: zodResolver(BrandSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand: CmsCreateBrandInput) => {
      const response = await createBrand(brand);
      const errorMessage = response.errors && response.errors[0].message;
      if (errorMessage) throw new Error(errorMessage);
      return response;
    },
    onSuccess: () => {
      notification.success({
        message: "Hurra!",
        description: "Varumärket har skapats.",
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_BRAND],
      });
      router.push(routes.LIST_BRAND);
    },
    onError: (error) => {
      console.log("error :>> ", error);
      notification.error({
        message: "Tyvärr!",
        description: error.message ?? "Varumärket kunde inte skapas.",
      });
    },
  });

  const onSubmit = async (formData: BrandSchemaType) => {
    const brand: CmsCreateBrandInput = {
      ...formData,
    };

    mutate(brand);
  };

  return (
    <BrandForm
      isPending={isPending}
      title="Skapa varumärke"
      submitLabel="Spara"
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      control={control}
      mode="create"
    />
  );
};

export default CreateBrand;
