"use client";

import React from "react";
import UploadImage from "@/components/file/upload-image";
import {
  ImageLibrarySchema,
  ImageLibrarySchemaType,
} from "@/schema/image-library-schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "@/components/form-field";
import AdminForm from "@/components/admin-form";
import { Button, Divider, App } from "antd";
import Section from "@/components/section";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CmsCreateFilesInput } from "gql/graphql";
import { createFiles } from "@/queries/file/create-file";
import { queryKeys } from "@/lib/query-keys";
import { getFileInputTypes, uploadFiles } from "@/utils/file-utils";
import ImageLibrary from "@/components/file/image-library";

const ImageLibraryPage = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ImageLibrarySchemaType>({
    resolver: zodResolver(ImageLibrarySchema),
    defaultValues: {
      images: [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateFilesInput) => {
      const response = await createFiles(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      reset();
      notification.success({
        message: "Hurra!",
        description: "Bilderna har laddats up.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Bilderna kunde inte laddas up.",
      });
    },
  });

  const onSubmit = async (formData: ImageLibrarySchemaType) => {
    const input: CmsCreateFilesInput = {
      files: getFileInputTypes(formData.images),
    };

    const { presignedPutUrls } = await mutateAsync(input);
    if (presignedPutUrls) {
      const isOk = await uploadFiles(presignedPutUrls, formData.images);

      if (isOk) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_IMAGES] });
      }
    }
  };

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <AdminForm onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <Divider orientation="left">Ladda upp bilder</Divider>

          <Controller
            control={control}
            name="images"
            render={({ field: { value, onChange } }) => (
              <FormField label="Bilder" error={errors.images?.message}>
                <UploadImage
                  files={value}
                  setFiles={onChange}
                  allowedFileNumber={5}
                  aspectSlider
                />
              </FormField>
            )}
          />

          <Button
            disabled={watch("images").length < 1 || isPending}
            type="primary"
            htmlType="submit"
            size="middle"
            loading={isPending}
          >
            Ladda upp
          </Button>
        </Section>
      </AdminForm>

      <Section>
        <ImageLibrary />
      </Section>
    </div>
  );
};

export default ImageLibraryPage;
