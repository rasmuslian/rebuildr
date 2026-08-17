"use client";

import React from "react";
import { Button, Input, Checkbox } from "antd";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import { CategorySchemaType } from "@/schema/category-schema";
import UploadImage from "@components/file/upload-image";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";
import { measurements } from "@/constants/measurements";
import { MeasurementTypeEnum } from "gql/graphql";
import SelectRootCategory from "@components/category/select-root-category";
import SelectBrands from "@components/brand/select-brands";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<CategorySchemaType>;
  onSubmit: (formValues: CategorySchemaType) => void;
  errors: FieldErrors<CategorySchemaType>;
  control: Control<CategorySchemaType>;
  submitLabel: string;
  isPending: boolean;
  onGenerateImage?: (formValues: CategorySchemaType) => void;
};

const CategoryForm = ({
  title,
  onSubmit,
  handleSubmit,
  errors,
  control,
  submitLabel,
  isPending,
  onGenerateImage,
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
        name="image"
        render={({ field: { value, onChange } }) => (
          <FormField label="Bild" error={errors.image?.message}>
            <div className="flex flex-col items-start gap-3">
              <UploadImage files={value} setFiles={onChange} />
              {onGenerateImage && (
                <Button
                  loading={isPending}
                  onClick={handleSubmit(onGenerateImage)}
                >
                  Generera bild med AI
                </Button>
              )}
            </div>
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
                    disabled={m === MeasurementTypeEnum.Weight}
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
          <FormField
            label="Beskrivning"
            error={errors.description?.message}
            required
          >
            <Input.TextArea {...field} rows={4} placeholder="Beskrivning ..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="searchAliases"
        render={({ field: { value, onChange } }) => (
          <FormField label="Sökalias" error={errors.searchAliases?.message}>
            <Input.TextArea
              value={value?.join(", ")}
              rows={3}
              placeholder="Ex. såg, bågfil, handsåg"
              onChange={(event) =>
                onChange(
                  event.target.value
                    .split(",")
                    .map((term) => term.trim())
                    .filter(Boolean),
                )
              }
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="parentId"
        render={({ field: { value, onChange } }) => (
          <FormField label="Huvudkategori" error={errors.parentId?.message}>
            <SelectRootCategory value={value} onChange={onChange} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="brandIds"
        render={({ field: { value, onChange } }) => (
          <FormField label="Varumärken" error={errors.parentId?.message}>
            <SelectBrands value={value} onChange={onChange} />
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
