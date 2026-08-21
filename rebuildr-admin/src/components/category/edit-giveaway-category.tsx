"use client";

import { App, Button } from "antd";
import { Category } from "gql/graphql";
import React, { useState } from "react";

import AdminForm from "@/components/admin-form";
import UploadImage from "@/components/file/upload-image";
import FormField from "@/components/form-field";
import { routes } from "@/lib/routes";
import { updateGiveawayCategoryImage } from "@/queries/category/update-giveaway-category-image";
import {
  getFileInputTypes,
  getUploadFiles,
  uploadFiles,
} from "@/utils/file-utils";
import { revalidate } from "@/actions/revalidate";
import { useMutation } from "@tanstack/react-query";

const EditGiveawayCategory = ({ category }: { category: Category }) => {
  const { notification } = App.useApp();
  const [files, setFiles] = useState(
    category.image ? getUploadFiles([category.image]) : [],
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateGiveawayCategoryImage,
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const image = getFileInputTypes(files)[0];
    if (!image) {
      notification.error({ message: "Välj en bild först." });
      return;
    }

    try {
      const response = await mutateAsync(image);
      if (!response) throw new Error();
      if (response.imagePutUrl) {
        await uploadFiles([response.imagePutUrl], files);
      }
      notification.success({ message: "Kategoribilden har uppdaterats." });
      await revalidate(`${routes.EDIT_CATEGORY}/${category.id}`);
    } catch {
      notification.error({ message: "Kategoribilden kunde inte uppdateras." });
    }
  };

  return (
    <AdminForm title="Bortskänkes" type="raised" onSubmit={onSubmit}>
      <FormField label="Bild" required>
        <UploadImage files={files} setFiles={setFiles} />
      </FormField>
      <Button type="primary" htmlType="submit" loading={isPending}>
        Spara bild
      </Button>
    </AdminForm>
  );
};

export default EditGiveawayCategory;
