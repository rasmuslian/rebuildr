"use client";

import React from "react";
import { Button, Input, InputNumber } from "antd";
import { ProductSchemaType } from "@/schema/product-schema";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadMedia from "@components/media/upload-media";
import SelectCategory from "@components/category/select-category";
import SelectBrand from "@components/brand/select-brand";
import SelectCondition from "@components/condition/select-condition";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  UseFormWatch,
  Controller,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<ProductSchemaType>;
  onSubmit: (formValues: ProductSchemaType) => void;
  errors: FieldErrors<ProductSchemaType>;
  control: Control<ProductSchemaType>;
  watch: UseFormWatch<ProductSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const ProductForm = ({
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
    <AdminForm title={title} type="raised" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="images"
        render={({ field: { value, onChange } }) => (
          <FormField label="Bild" error={errors.images?.message}>
            <UploadMedia
              files={value}
              setFiles={onChange}
              allowedFileNumber={10}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField label="Rubrik" error={errors.title?.message}>
            <Input {...field} placeholder="Titel" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField label="Beskrivning" error={errors.description?.message}>
            <Input.TextArea {...field} rows={4} placeholder="Beskrivning ..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="price"
        render={({ field: { value, onChange } }) => (
          <FormField label="Pris" error={errors.price?.message}>
            <InputNumber
              value={value}
              onChange={onChange}
              placeholder="Pris ..."
              style={{ width: "100%" }}
              type="number"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field: { value, onChange } }) => (
          <FormField label="Kategori" error={errors.categoryId?.message}>
            <SelectCategory
              categoryId={value}
              onSelectCategory={(categoryId) => onChange(categoryId)}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="brandId"
        render={({ field: { value, onChange } }) => (
          <FormField label="Märke" error={errors.brandId?.message}>
            <SelectBrand
              brandId={value}
              onSelectBrand={(brandId) => onChange(brandId)}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="condition"
        render={({ field: { value, onChange } }) => (
          <FormField label="Skick" error={errors.condition?.message}>
            <SelectCondition
              condition={value}
              onSelectCondition={(condition) => onChange(condition)}
            />
          </FormField>
        )}
      />

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default ProductForm;
