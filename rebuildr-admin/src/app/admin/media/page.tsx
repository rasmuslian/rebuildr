"use client";

import React from "react";
import UploadMedia from "@/components/media/upload-media";
import { MediaSchema, MediaSchemaType } from "@/schema/media-schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "@/components/form-field";
import AdminForm from "@/components/admin-form";
import { Button, Divider, App } from "antd";
import Section from "@/components/section";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CmsUploadFileInput } from "gql/graphql";
import { createMedia } from "@/queries/media/create-media";
import { queryKeys } from "@/lib/query-keys";
import { getFileInputTypes, uploadFiles } from "@/utils/medial-utils";
import ListMedia from "@/components/media/list-media";

const MediaPage = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MediaSchemaType>({
    resolver: zodResolver(MediaSchema),
    defaultValues: {
      images: [],
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (uploadFileInput: CmsUploadFileInput) => {
      const response = await createMedia(uploadFileInput);
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

  const onSubmit = async (formData: MediaSchemaType) => {
    const uploadFileInput: CmsUploadFileInput = {
      images: getFileInputTypes(formData.images),
    };

    const { presignedPutUrls } = await mutateAsync(uploadFileInput);
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
                <UploadMedia
                  files={value}
                  setFiles={onChange}
                  allowedFileNumber={5}
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
        <Divider orientation="left">Alla uppladade bilder</Divider>
        <ListMedia />
      </Section>
    </div>
  );
};

export default MediaPage;
