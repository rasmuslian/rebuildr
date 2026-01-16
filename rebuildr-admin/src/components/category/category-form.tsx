"use client";

import React from "react";
import { Button, Input, Checkbox } from "antd";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import { CategorySchemaType } from "@/schema/category-schema";
import UploadMedia from "@components/media/upload-media";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";
import { measurements } from "@/constants/measurements";
import { MeasurementTypeEnum } from "gql/graphql";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<CategorySchemaType>;
  onSubmit: (formValues: CategorySchemaType) => void;
  errors: FieldErrors<CategorySchemaType>;
  control: Control<CategorySchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const CategoryForm = ({
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
          <FormField label="Namn" error={errors.name?.message}>
            <Input {...field} placeholder="Namn ..." disabled />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="image"
        render={({ field: { value, onChange } }) => (
          <FormField label="Bild" error={errors.image?.message}>
            <UploadMedia files={value} setFiles={onChange} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="inSeason"
        render={({ field: { value, onChange } }) => (
          <FormField error={errors.inSeason?.message}>
            <Checkbox checked={value} onChange={onChange}>
              I säsong
            </Checkbox>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="inSelection"
        render={({ field: { value, onChange } }) => (
          <FormField error={errors.inSelection?.message}>
            <Checkbox checked={value} onChange={onChange}>
              Utvald
            </Checkbox>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="measurements"
        render={({ field: { value, onChange } }) => (
          <FormField error={errors.measurements?.message} label="Måttenheter">
            <div className="flex flex-row gap-4">
              {Object.keys(measurements).map((m, i) => {
                const isSelected = value.some((v) => v === m);
                return (
                  <Checkbox
                    key={i}
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        const tmp = value.filter((v) => v !== m);
                        onChange(tmp);
                      } else {
                        onChange([...value, m]);
                      }
                    }}
                  >
                    {measurements[m as MeasurementTypeEnum].name}
                  </Checkbox>
                );
              })}
            </div>
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

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default CategoryForm;
