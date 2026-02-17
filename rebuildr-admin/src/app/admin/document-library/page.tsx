"use client";

import React from "react";
import {
  DocumentLibrarySchema,
  DocumentLibrarySchemaType,
} from "@/schema/document-library-schema";
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
import DocumentLibrary from "@/components/file/document-library";
import UploadDocument from "@/components/file/upload-document";

const DocumentLibraryPage = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DocumentLibrarySchemaType>({
    resolver: zodResolver(DocumentLibrarySchema),
    defaultValues: {
      documents: [],
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
        description: "Dokumenten har laddats up.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Dokumenten kunde inte laddas up.",
      });
    },
  });

  const onSubmit = async (formData: DocumentLibrarySchemaType) => {
    const input: CmsCreateFilesInput = {
      files: getFileInputTypes(formData.documents),
    };

    const { presignedPutUrls } = await mutateAsync(input);
    if (presignedPutUrls) {
      const isOk = await uploadFiles(presignedPutUrls, formData.documents);

      if (isOk) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_DOCUMENTS] });
      }
    }
  };

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <AdminForm onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <Divider orientation="left">Ladda upp dokument</Divider>

          <Controller
            control={control}
            name="documents"
            render={({ field: { value, onChange } }) => (
              <FormField label="Dokument" error={errors.documents?.message}>
                <UploadDocument
                  files={value}
                  setFiles={onChange}
                  allowedFileNumber={5}
                />
              </FormField>
            )}
          />

          <Button
            disabled={watch("documents").length < 1 || isPending}
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
        <DocumentLibrary />
      </Section>
    </div>
  );
};

export default DocumentLibraryPage;
