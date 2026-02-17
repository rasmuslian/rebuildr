"use client";

import React from "react";
import { Button, Input } from "antd";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadImage from "@components/file/upload-image";
import { PartnerSchemaType } from "@/schema/partner-schema";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<PartnerSchemaType>;
  onSubmit: (formValues: PartnerSchemaType) => void;
  errors: FieldErrors<PartnerSchemaType>;
  control: Control<PartnerSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const PartnerForm = ({
  title,
  onSubmit,
  handleSubmit,
  errors,
  control,
  submitLabel,
  isPending,
}: Props) => {
  return (
    <AdminForm title={title} type="raised" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormField label="Namn" error={errors.name?.message} required>
            <Input {...field} placeholder="Namn ..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="logo"
        render={({ field: { value, onChange } }) => (
          <FormField label="Bild" error={errors.logo?.message} required>
            <UploadImage files={value} setFiles={onChange} aspectSlider />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <FormField label="Webbplats" error={errors.websiteUrl?.message}>
            <Input {...field} placeholder="https://" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField
            label="Beskrivning"
            error={errors.description?.message}
            required
          >
            <Input.TextArea {...field} rows={4} placeholder="Beskrivning ..." />
          </FormField>
        )}
      />

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default PartnerForm;
