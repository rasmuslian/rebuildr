"use client";

import React from "react";
import TextEditor from "@/components/editor/text-editor";
import ArticlePreview from "@/components/article/article-preview";
import { Button, Input } from "antd";
import AdminForm from "@components/admin-form";
import { ArticleSchemaType } from "@/schema/article-schema";
import FormField from "@components/form-field";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  UseFormWatch,
  Controller,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<ArticleSchemaType>;
  onSubmit: (formValues: ArticleSchemaType) => void;
  errors: FieldErrors<ArticleSchemaType>;
  control: Control<ArticleSchemaType>;
  watch: UseFormWatch<ArticleSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const ArticleForm = ({
  title,
  onSubmit,
  handleSubmit,
  errors,
  control,
  watch,
  submitLabel,
  isPending,
}: Props) => {
  return (
    <AdminForm title={title} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid max-w-screen-2xl grid-cols-[auto_375px] gap-5">
        <div className="flex flex-col gap-5">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <FormField
                label="Rubrik"
                required={true}
                error={errors.title?.message}
              >
                <Input {...field} placeholder="Titel" />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="body"
            render={({ field: { value, onChange } }) => (
              <FormField label="Artikel" error={errors.body?.message}>
                <TextEditor value={value} setValue={onChange} />
              </FormField>
            )}
          />

          <Button type="primary" htmlType="submit" loading={isPending}>
            {submitLabel}
          </Button>
        </div>

        <ArticlePreview html={watch("body") ?? ""} />
      </div>
    </AdminForm>
  );
};

export default ArticleForm;
