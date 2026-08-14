"use client";

import { Category, CmsUpdateCategoryInput } from "gql/graphql";
import React, { useState } from "react";
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
import { Alert, App } from "antd";
import { regenerateCategoryImage } from "@/queries/category/regenerate-category-image";

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
    setValue,
  } = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      inSeason: category.inSeason,
      inSelection: category.inSelection,
      name: category.name,
      description: category.description,
      image: category.image ? getUploadFiles([category.image]) : [],
      measurements: category.measurements,
      parentId: category.parentId ?? undefined,
      brandIds: category.brands.map((brand) => brand.id),
      searchAliases: category.searchAliases ?? [],
    },
  });

  const [imageGenerationFailed, setImageGenerationFailed] = useState(
    category.imageGenerationStatus === "FAILED",
  );

  const { mutate: retryImage, isPending: isRetryingImage } = useMutation({
    mutationFn: () => regenerateCategoryImage(category.id),
    onSuccess: async (updatedCategory) => {
      if (updatedCategory?.image) {
        setValue("image", getUploadFiles([updatedCategory.image]));
      }
      setImageGenerationFailed(false);
      notification.success({ message: "En ny kategoribild har skapats." });
      await revalidate(`${routes.EDIT_CATEGORY}/${category.id}`);
    },
    onError: () =>
      notification.error({ message: "Kategoribilden kunde inte genereras." }),
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
      ...formData,
      image: getFileInputTypes(formData.image)[0],
    };

    const response = await mutateAsync(updatedCategory);

    if (response.imagePutUrl) {
      await uploadFiles([response.imagePutUrl], formData.image);
    }
  };

  return (
    <>
      {imageGenerationFailed && (
        <Alert
          type="warning"
          showIcon
          message="Kategoribilden kunde inte genereras"
          description={
            category.imageGenerationError ??
            "Ladda upp en egen bild eller försök igen."
          }
        />
      )}
      <CategoryForm
        title="Redigera Kategori"
        control={control}
        errors={errors}
        isPending={isPending || isRetryingImage}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onGenerateImage={() => retryImage()}
        submitLabel="Spara"
      />
    </>
  );
};

export default EditCategory;
