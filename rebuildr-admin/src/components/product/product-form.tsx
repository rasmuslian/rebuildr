"use client";

import React from "react";
import { Button, Divider, Input, InputNumber, Checkbox } from "antd";
import { ProductSchemaType } from "@/schema/product-schema";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadMedia from "@components/media/upload-media";
import SelectCategory from "@components/category/select-category";
import SelectBrand from "@components/brand/select-brand";
import SelectCondition from "@components/condition/select-condition";
import SelectQuantityUnit from "@components/quantity-unit/select-quantity-unit";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  UseFormWatch,
  Controller,
  UseFormSetValue,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<ProductSchemaType>;
  onSubmit: (formValues: ProductSchemaType) => void;
  errors: FieldErrors<ProductSchemaType>;
  control: Control<ProductSchemaType>;
  watch: UseFormWatch<ProductSchemaType>;
  setValue: UseFormSetValue<ProductSchemaType>;
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
  setValue,
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

      <div className="flex flex-col rounded-md bg-neutral-100 p-4">
        <Divider orientation="left" size="small">
          Primära antal och enhet
        </Divider>

        <div className="flex flex-row gap-5">
          <Controller
            control={control}
            name="primaryMeasurement.quantity"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Antal"
                error={errors.primaryMeasurement?.quantity?.message}
              >
                <InputNumber
                  value={value}
                  onChange={onChange}
                  placeholder="Antal ..."
                  style={{ width: "100%" }}
                  type="number"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="primaryMeasurement.unit"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Enhet"
                error={errors.primaryMeasurement?.unit?.message}
              >
                <SelectQuantityUnit
                  quantityUnit={value}
                  onSelectQuantityUnit={(quantityUnit) =>
                    onChange(quantityUnit)
                  }
                />
              </FormField>
            )}
          />
        </div>
      </div>

      <Controller
        control={control}
        name="secondaryMeasurement.enabled"
        render={({ field: { value, onChange } }) => (
          <FormField error={errors.secondaryMeasurement?.enabled?.message}>
            <Checkbox
              checked={value}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange(checked);

                if (!checked) {
                  setValue("secondaryMeasurement", {
                    enabled: false,
                    quantity: undefined,
                    unit: undefined,
                  });
                }
              }}
            >
              Lägg till ytterligare antal och enhet
            </Checkbox>
          </FormField>
        )}
      />

      {watch("secondaryMeasurement.enabled") && (
        <div className="flex flex-col rounded-md bg-neutral-100 p-4">
          <Divider orientation="left" size="small">
            Sekundär antal och enhet
          </Divider>

          <div className="flex flex-row gap-5">
            <Controller
              control={control}
              name="secondaryMeasurement.quantity"
              render={({ field: { value, onChange } }) => (
                <FormField
                  label="Antal"
                  error={errors.secondaryMeasurement?.quantity?.message}
                >
                  <InputNumber
                    value={value}
                    onChange={onChange}
                    placeholder="Antal ..."
                    style={{ width: "100%" }}
                    type="number"
                  />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="secondaryMeasurement.unit"
              render={({ field: { value, onChange } }) => (
                <FormField
                  label="Enhet"
                  error={errors.secondaryMeasurement?.unit?.message}
                >
                  <SelectQuantityUnit
                    quantityUnit={value ?? undefined}
                    onSelectQuantityUnit={(quantityUnit) =>
                      onChange(quantityUnit)
                    }
                  />
                </FormField>
              )}
            />
          </div>
        </div>
      )}

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default ProductForm;
