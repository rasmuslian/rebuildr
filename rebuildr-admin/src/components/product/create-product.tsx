"use client";

import React from "react";
import ProductForm from "@components/product/product-form";
import { ProductSchemaType, ProductSchema } from "@/schema/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { getFileInputTypes, uploadFiles } from "@utils/medial-utils";
import { CmsCreateProductInput } from "gql/graphql";
import { createProduct } from "@/queries/product/create-product";
import { queryKeys } from "@/lib/query-keys";

const CreateProduct = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      images: [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateProductInput) => {
      const response = await createProduct(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Hurra!",
        description: "Produkten har skapats.",
      });
      router.push(routes.LIST_PRODUCT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Produkten kunde inte skapas.",
      });
    },
  });

  const onSubmit = async (formData: ProductSchemaType) => {
    const newProduct: CmsCreateProductInput = {
      title: formData.title,
      description: formData.description,
      brandId: formData.brandId,
      categoryId: formData.categoryId,
      condition: formData.condition,
      price: formData.price,
      images: getFileInputTypes(formData.images),
    };

    const response = await mutateAsync(newProduct);
    if (response.imagePutUrls) {
      await uploadFiles(response.imagePutUrls, formData.images);
    }
  };

  return (
    <ProductForm
      title="Skapa produkt"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="Publicera"
      watch={watch}
    />
  );
};

export default CreateProduct;
