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
import SelectMeasurement from "@components/measurement/select-measurement";
import Section from "@components/section";
import {
  measurements,
  MeasurementType,
  measurementKeys,
} from "@/constants/measurements";
import SearchAddress from "@components/address/search-address";
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
    <AdminForm onSubmit={handleSubmit(onSubmit)}>
      <Section>
        <div className="grid grid-cols-[auto_448px] gap-8">
          <Divider size="small" orientation="left" type="horizontal">
            {title}
          </Divider>

          <Button type="primary" htmlType="submit" loading={isPending} block>
            {submitLabel}
          </Button>
        </div>
      </Section>

      <div className="grid grid-cols-[auto_480px] gap-4">
        <Section>
          <Controller
            control={control}
            name="images"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Bild"
                required={true}
                error={errors.images?.message}
              >
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
            name="description"
            render={({ field }) => (
              <FormField
                label="Beskrivning"
                required={true}
                error={errors.description?.message}
              >
                <Input.TextArea
                  {...field}
                  rows={4}
                  placeholder="Beskrivning ..."
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Pris"
                required={true}
                error={errors.price?.message}
              >
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
              <FormField
                label="Kategori"
                required={true}
                error={errors.categoryId?.message}
              >
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
              <FormField
                label="Märke"
                required={true}
                error={errors.brandId?.message}
              >
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
              <FormField
                label="Skick"
                required={true}
                error={errors.condition?.message}
              >
                <SelectCondition
                  condition={value}
                  onSelectCondition={(condition) => onChange(condition)}
                />
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
                <SearchAddress
                  address={value}
                  onSelectAddress={(address) => onChange(address)}
                />
              </FormField>
            )}
          />
        </Section>

        <Section>
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
                    required={true}
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
                    required={true}
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

          <Controller
            control={control}
            name="measurement.enabled"
            render={({ field: { value, onChange } }) => (
              <FormField error={errors.secondaryMeasurement?.enabled?.message}>
                <Checkbox
                  checked={value}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange(checked);

                    if (!checked) {
                      setValue("measurement", {
                        enabled: false,
                        ...Object.fromEntries(
                          measurementKeys.flatMap((key) => [[key, undefined]]),
                        ),
                      });
                    }
                  }}
                >
                  Lägg till produktdetaljer
                </Checkbox>
              </FormField>
            )}
          />

          {watch("measurement.enabled") && (
            <div className="flex flex-col gap-4 rounded-md bg-neutral-100 p-4">
              <Divider orientation="left" size="small">
                Produktdetaljer
              </Divider>

              {Object.entries(measurements).map(([key, measurement]) => {
                const measurementType = key as MeasurementType;

                return (
                  <div className="flex flex-row gap-5" key={measurementType}>
                    <Controller
                      control={control}
                      name={`measurement.${measurementType}`}
                      render={({ field: { value, onChange } }) => (
                        <FormField
                          label={measurement.name}
                          error={errors.measurement?.[measurementType]?.message}
                        >
                          <InputNumber
                            value={value}
                            onChange={onChange}
                            placeholder={`${measurement.name} ...`}
                            style={{ width: "100%" }}
                            type="number"
                          />
                        </FormField>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`measurement.${measurementType}Unit`}
                      render={({ field: { value, onChange } }) => (
                        <FormField label={`${measurement.name} enhet`}>
                          <SelectMeasurement
                            measurementType={measurementType}
                            measurementUnit={value}
                            onSelectSeasurementUnit={(unit) => onChange(unit)}
                          />
                        </FormField>
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </AdminForm>
  );
};

export default ProductForm;
