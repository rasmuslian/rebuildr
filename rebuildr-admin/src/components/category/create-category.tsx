"use client";

import { CmsCreateCategoryInput } from "gql/graphql";
import React from "react";
import CategoryForm from "./category-form";
import { useForm } from "react-hook-form";
import { CategorySchema, CategorySchemaType } from "@/schema/category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createCategory } from "@/queries/category/create-category";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { getFileInputTypes, uploadFiles } from "@utils/file-utils";
import { App } from "antd";
import { revalidate } from "@/actions/revalidate";

const CreateCategory = () => {
  const { notification } = App.useApp();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      inSeason: false,
      inSelection: false,
      measurements: [],
      image: [],
      parentId: undefined,
      brandIds: [],
      searchAliases: [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateCategoryInput) => {
      const response = await createCategory(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      notification.success({
        message: "Hurra!",
        description: "Kategorin har skapats.",
      });
      await revalidate(`${routes.LIST_CATEGORY}`);
      router.push(routes.LIST_CATEGORY);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Kategorin kunde inte skapas.",
      });
    },
  });

  const onSubmit = async (formData: CategorySchemaType) => {
    const newCategory: CmsCreateCategoryInput = {
      ...formData,
      image: getFileInputTypes(formData.image)[0],
    };

    const response = await mutateAsync(newCategory);

    if (response.imagePutUrl) {
      await uploadFiles([response.imagePutUrl], formData.image);
    }
  };

  return (
    <CategoryForm
      title="Skapa Kategori"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Skapa"
    />
  );
};

export default CreateCategory;
