"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadImage from "@components/file/upload-image";
import {
  NewsletterCompetitionSchema,
  NewsletterCompetitionSchemaType,
} from "@/schema/newsletter-competition-schema";
import { getNewsletterCompetition } from "@/queries/newsletter/get-newsletter-competition";
import { updateNewsletterCompetition } from "@/queries/newsletter/update-newsletter-competition";
import { getFileInputTypes, getUploadFiles, uploadFiles } from "@/utils/file-utils";
import { queryKeys } from "@/lib/query-keys";

const EditNewsletterCompetition = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.NEWSLETTER_COMPETITION],
    queryFn: getNewsletterCompetition,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterCompetitionSchemaType>({
    resolver: zodResolver(NewsletterCompetitionSchema),
    values: data
      ? {
          title: data.title,
          productTitle: data.productTitle,
          productValue: data.productValue,
          bodyText: data.bodyText,
          nextDrawDate: dayjs(data.nextDrawDate),
          productImage: data.productImage
            ? getUploadFiles([data.productImage])
            : [],
        }
      : undefined,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (formData: NewsletterCompetitionSchemaType) => {
      const productImageInput = getFileInputTypes(
        formData.productImage ?? [],
      )[0];

      const response = await updateNewsletterCompetition({
        title: formData.title,
        productTitle: formData.productTitle,
        productValue: formData.productValue,
        bodyText: formData.bodyText,
        nextDrawDate: formData.nextDrawDate.toDate(),
        ...(productImageInput ? { productImage: productImageInput } : {}),
      });

      if (response?.imagePutUrl && productImageInput) {
        await uploadFiles([response.imagePutUrl], formData.productImage ?? []);
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.NEWSLETTER_COMPETITION],
      });
      notification.success({
        message: "Sparat!",
        description: "Nyhetsbrevssidan har uppdaterats.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Det gick inte att spara ändringarna.",
      });
    },
  });

  if (isLoading) return null;

  return (
    <AdminForm
      title="Nyhetsbrev & tävling"
      type="raised"
      onSubmit={handleSubmit((data) => mutateAsync(data))}
    >
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField
            label="Titel"
            error={errors.title?.message}
            required
          >
            <Input {...field} placeholder="T.ex. Vinn verktyg för 10 000 kr varje vecka." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="productTitle"
        render={({ field }) => (
          <FormField
            label="Produkttitel"
            error={errors.productTitle?.message}
            required
          >
            <Input {...field} placeholder="T.ex. DeWalt verktygspaket" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="productValue"
        render={({ field }) => (
          <FormField
            label="Produktvärde"
            error={errors.productValue?.message}
            required
          >
            <Input {...field} placeholder="T.ex. 10 000 sek" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="productImage"
        render={({ field: { value, onChange } }) => (
          <FormField
            label="Produktbild"
            error={errors.productImage?.message}
          >
            <UploadImage files={value} setFiles={onChange} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="bodyText"
        render={({ field }) => (
          <FormField
            label="Brödtext (Markdown)"
            error={errors.bodyText?.message}
            description='Stöd för markdown. Använd [text](url) för länkar, t.ex. [Instagram](https://instagram.com/rebuildr.se)'
            required
          >
            <Input.TextArea
              {...field}
              rows={6}
              placeholder="Börja prenumerera på vårt RebuildR nyhetsbrev..."
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="nextDrawDate"
        render={({ field }) => (
          <FormField
            label="Nästa dragning"
            error={errors.nextDrawDate?.message as string}
            required
          >
            <DatePicker
              {...field}
              style={{ width: "100%" }}
              showTime={false}
            />
          </FormField>
        )}
      />

      <Button type="primary" htmlType="submit" loading={isPending}>
        Spara
      </Button>
    </AdminForm>
  );
};

export default EditNewsletterCompetition;
