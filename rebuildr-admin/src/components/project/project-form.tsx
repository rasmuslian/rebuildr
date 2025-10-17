"use client";

import React from "react";
import { ProjectSchemaType } from "@/schema/project-schema";
import { Button, Divider, Input } from "antd";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import SelectAddress from "@components/address/select-address";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<ProjectSchemaType>;
  onSubmit: (formValues: ProjectSchemaType) => void;
  errors: FieldErrors<ProjectSchemaType>;
  control: Control<ProjectSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const ProjectForm = ({
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
        name="title"
        render={({ field }) => (
          <FormField label="Namn" required={true} error={errors.title?.message}>
            <Input {...field} placeholder="Namn" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField
            label="Beskrivning"
            required={true}
            error={errors.description?.message}
          >
            <Input.TextArea {...field} rows={4} placeholder="Beskrivning ..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name={"address"}
        render={({ field: { value, onChange } }) => (
          <FormField
            label="Adress"
            required={true}
            error={errors.address?.message}
          >
            <SelectAddress value={value} onChange={onChange} />
          </FormField>
        )}
      />

      <div className="flex flex-col gap-4 rounded-md bg-neutral-100 p-4">
        <Divider orientation="left" size="small">
          Kontaktuppgifter
        </Divider>

        <Controller
          control={control}
          name="contact.name"
          render={({ field }) => (
            <FormField label="Namn" error={errors.contact?.name?.message}>
              <Input {...field} placeholder="Namn" />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="contact.email"
          render={({ field }) => (
            <FormField label="E-post" error={errors.contact?.email?.message}>
              <Input {...field} placeholder="E-post" />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="contact.phone"
          render={({ field }) => (
            <FormField
              label="Telefonnummer"
              error={errors.contact?.phone?.message}
            >
              <Input {...field} placeholder="Telefonnummer" />
            </FormField>
          )}
        />
      </div>

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default ProjectForm;
