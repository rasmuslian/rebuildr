"use client";

import { Category, CmsUpdateCategoryInput } from "gql/graphql";
import React from "react";
import CategoryForm from "./category-form";
import { useForm } from "react-hook-form";
import { CategorySchema, CategorySchemaType } from "@/schema/category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateCategory } from "@/queries/category/update-category";
import { routes } from "@/lib/routes";
import { revalidate } from "@/actions/revalidate";
import { useRouter } from "next/navigation";
import {
  getFileInputTypes,
  getUploadFiles,
  uploadFiles,
} from "@utils/file-utils";
import { App } from "antd";

type Props = {
  category: Category;
};

const EditCategory = ({ category }: Props) => {
  const { notification } = App.useApp();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      inSeason: category.inSeason,
      inSelection: category.inSelection,
      name: category.name,
      description: category.description,
      image: category.image ? getUploadFiles([category.image]) : [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateCategoryInput) => {
      const response = await updateCategory(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      notification.success({
        message: "Hurra!",
        description: "Kategorin har uppdaterats.",
      });
      await revalidate(`${routes.EDIT_CATEGORY}/${category.id}`);
      router.push(routes.LIST_CATEGORY);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Kategorin kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: CategorySchemaType) => {
    const updatedCategory: CmsUpdateCategoryInput = {
      id: category.id,
      inSeason: formData.inSeason,
      inSelection: formData.inSelection,
      image: getFileInputTypes(formData.image)[0],
      description: formData.description,
    };

    const response = await mutateAsync(updatedCategory);

    if (response.imagePutUrl) {
      await uploadFiles([response.imagePutUrl], formData.image);
    }
  };

  return (
    <CategoryForm
      title="Redigera Kategori"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Spara"
    />
  );
};

export default EditCategory;
