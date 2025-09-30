import React from "react";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import { Divider, Button, Input, InputNumber } from "antd";
import { FooterSectionSchemaType } from "@/schema/footer-section-schema";
import SelectAricleTable from "@components/article/select-article-table";
import DragAndDropArticles from "@components/footer/drag-and-drop-articles";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<FooterSectionSchemaType>;
  onSubmit: (formValues: FooterSectionSchemaType) => void;
  errors: FieldErrors<FooterSectionSchemaType>;
  control: Control<FooterSectionSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const FooterSectionForm = ({
  title,
  handleSubmit,
  onSubmit,
  errors,
  control,
  submitLabel,
  isPending,
}: Props) => {
  return (
    <AdminForm>
      <Divider orientation="left">{title}</Divider>

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField label="Rubrik" error={errors.title?.message}>
            <Input {...field} placeholder="Ange rubrik..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="orderIndex"
        render={({ field }) => (
          <FormField label="Position" error={errors.orderIndex?.message}>
            <InputNumber
              {...field}
              placeholder="Ange sorteringsposition (t.ex. 1, 2, 3 …)"
              style={{ width: "100%" }}
              min={1}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="articles"
        render={({ field: { onChange, value } }) => {
          return (
            <div className="grid grid-cols-[auto_320px] gap-5">
              <FormField label="Välj artiklar" error={errors.articles?.message}>
                <SelectAricleTable articles={value} setArticles={onChange} />
              </FormField>

              <DragAndDropArticles
                articles={value}
                setArticles={onChange}
                title="Valda artiklar"
              />
            </div>
          );
        }}
      />

      <Button
        type="primary"
        htmlType="button"
        size="middle"
        onClick={handleSubmit(onSubmit)}
        loading={isPending}
      >
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default FooterSectionForm;
