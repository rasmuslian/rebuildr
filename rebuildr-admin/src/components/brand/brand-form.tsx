"use client";

import React from "react";
import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { BrandSchemaType } from "@/schema/brand-schema";
import { Button, Input } from "antd";
import Section from "@/components/section";

import {
  FieldErrors,
  UseFormHandleSubmit,
  Control,
  Controller,
} from "react-hook-form";

type Props = {
  isPending: boolean;
  title: string;
  submitLabel: string;
  handleSubmit: UseFormHandleSubmit<BrandSchemaType>;
  onSubmit: (formValues: BrandSchemaType) => void;
  errors: FieldErrors<BrandSchemaType>;
  control: Control<BrandSchemaType>;
  mode: "edit" | "create";
};

const BrandForm = ({
  isPending,
  title,
  handleSubmit,
  onSubmit,
  control,
  errors,
  submitLabel,
}: Props) => {
  return (
    <AdminForm title={title} onSubmit={handleSubmit(onSubmit)}>
      <Section>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <FormField label="Namn" error={errors.name?.message}>
              <Input placeholder="Namn ..." value={value} onChange={onChange} />
            </FormField>
          )}
        />

        <Button loading={isPending} htmlType="submit" type="primary">
          {submitLabel}
        </Button>
      </Section>
    </AdminForm>
  );
};

export default BrandForm;
