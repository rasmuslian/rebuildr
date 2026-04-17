"use client";

import React from "react";
import { Button, Input, InputNumber, Checkbox } from "antd";
import { ProductSchemaType } from "@/schema/product-schema";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadImage from "@/components/file/upload-image";
import UploadDocument from "@/components/file/upload-document";
import SelectCategory from "@components/category/select-category";
import SelectBrand from "@components/brand/select-brand";
import SelectCondition from "@components/condition/select-condition";
import SelectQuantityUnit from "@components/quantity-unit/select-quantity-unit";
import SelectMeasurement from "@components/measurement/select-measurement";
import SelectProject from "@components/project/select-project";
import SelectUser from "@components/user/select-user";
import SelectAddress from "@components/address/select-address";
import SelectShippingPrice from "@components/shipping-price/select-shipping-price";
import SelectColorType from "@components/color/select-color-type";
import Section from "@components/section";
import {
  measurements,
  productFieldMeasurementKeys,
} from "@/constants/measurements";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  UseFormWatch,
  Controller,
  UseFormSetValue,
  UseFormClearErrors,
} from "react-hook-form";
import { ColorTypeEnum, MeasurementTypeEnum } from "gql/graphql";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<ProductSchemaType>;
  onSubmit: (formValues: ProductSchemaType) => void;
  errors: FieldErrors<ProductSchemaType>;
  control: Control<ProductSchemaType>;
  watch: UseFormWatch<ProductSchemaType>;
  setValue: UseFormSetValue<ProductSchemaType>;
  clearErrors: UseFormClearErrors<ProductSchemaType>;
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
  clearErrors,
  submitLabel,
  isPending,
}: Props) => {
  return (
    <AdminForm onSubmit={handleSubmit(onSubmit)}>
      <Section>
        <div className="flex flex-row justify-between gap-4">
          <p className="flex flex-col justify-center text-title-medium">
            {title}
          </p>

          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            style={{ width: 180 }}
          >
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
                label="Bilder"
                required={true}
                error={errors.images?.message}
              >
                <UploadImage
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
                <Input {...field} placeholder="Rubrik ..." />
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
                  rows={10}
                  placeholder="Beskrivning ..."
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="pricing.price"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Pris (kr)"
                required={!watch("pricing.isGiveaway")}
                error={errors.pricing?.price?.message}
              >
                <InputNumber
                  value={value}
                  onChange={(price) => {
                    onChange(price);
                    if (!price || price === 0) {
                      setValue("pricing.isGiveaway", true);
                      onChange(0);
                    } else {
                      setValue("pricing.isGiveaway", false);
                      onChange(price);
                    }
                  }}
                  placeholder="Pris ..."
                  style={{ width: "100%" }}
                  type="number"
                  min={0}
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="pricing.isGiveaway"
            render={({ field: { value, onChange } }) => (
              <FormField error={errors.pricing?.isGiveaway?.message}>
                <Checkbox
                  checked={value}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange(checked);
                    if (checked) {
                      setValue("pricing.price", 0);
                      clearErrors("pricing.price");
                    }
                  }}
                >
                  Bortskänkes
                </Checkbox>
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
                <SelectCategory value={value} onChange={onChange} />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="brandId"
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Varumärke"
                required={true}
                error={errors.brandId?.message}
              >
                <SelectBrand value={value} onChange={onChange} />
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
                <SelectCondition value={value} onChange={onChange} />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name={"project.address"}
            render={({ field: { value, onChange } }) => (
              <FormField
                label="Adress"
                required={!watch("project.hasProject")}
                error={errors.project?.address?.message}
                description={
                  watch("project.hasProject")
                    ? "Projektets adress kommer att användas."
                    : undefined
                }
              >
                <SelectAddress
                  value={value}
                  onChange={onChange}
                  disabled={watch("project.hasProject")}
                />
              </FormField>
            )}
          />
        </Section>

        <div className="flex flex-col gap-5">
          <Section>
            <Controller
              control={control}
              name="sellerId"
              render={({ field: { value, onChange } }) => (
                <FormField
                  label="Ägare"
                  required={true}
                  error={errors.sellerId?.message}
                >
                  <SelectUser
                    value={value}
                    onChange={(userId) => {
                      onChange(userId);
                      setValue("project.projectId", undefined);
                      clearErrors("project.projectId");
                    }}
                  />
                </FormField>
              )}
            />
          </Section>

          <Section>
            <div className="flex flex-col rounded-md bg-neutral-100 p-4">
              <div className="flex flex-row gap-5">
                <Controller
                  control={control}
                  name="primaryMeasurement.quantity"
                  render={({ field }) => (
                    <FormField
                      label="Antal"
                      required={true}
                      error={errors.primaryMeasurement?.quantity?.message}
                    >
                      <InputNumber
                        {...field}
                        placeholder="Antal ..."
                        style={{ width: "100%" }}
                        type="number"
                        size="middle"
                        precision={0}
                        step={1}
                        min={1}
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
                      <SelectQuantityUnit value={value} onChange={onChange} />
                    </FormField>
                  )}
                />
              </div>
            </div>

            <Controller
              control={control}
              name="secondaryMeasurement.enabled"
              render={({ field: { value, onChange } }) => (
                <FormField
                  error={errors.secondaryMeasurement?.enabled?.message}
                >
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
                <div className="flex flex-row gap-5">
                  <Controller
                    control={control}
                    name="secondaryMeasurement.quantity"
                    render={({ field }) => (
                      <FormField
                        label="Antal"
                        required={true}
                        error={errors.secondaryMeasurement?.quantity?.message}
                      >
                        <InputNumber
                          {...field}
                          placeholder="Antal ..."
                          style={{ width: "100%" }}
                          type="number"
                          size="middle"
                          precision={0}
                          step={1}
                          min={1}
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
                        required={true}
                        error={errors.secondaryMeasurement?.unit?.message}
                      >
                        <SelectQuantityUnit value={value} onChange={onChange} />
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
                <FormField
                  error={errors.secondaryMeasurement?.enabled?.message}
                >
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);

                      if (!checked) {
                        const resetMeasurement =
                          productFieldMeasurementKeys.reduce(
                            (acc, key) => ({ ...acc, [key]: undefined }),
                            { enabled: false },
                          );

                        setValue("measurement", resetMeasurement);
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
                {Object.entries(measurements).map(([key, measurement]) => {
                  const measurementType = key as MeasurementTypeEnum;

                  return (
                    <div className="flex flex-row gap-5" key={measurementType}>
                      <Controller
                        control={control}
                        name={`measurement.${measurement.productField}`}
                        render={({ field }) => (
                          <FormField
                            label={measurement.name}
                            error={
                              errors.measurement?.[measurement.productField]
                                ?.message
                            }
                          >
                            <InputNumber
                              {...field}
                              placeholder={`${measurement.name} ...`}
                              style={{ width: "100%" }}
                              size="middle"
                              type="number"
                              precision={0}
                              step={1}
                              min={1}
                            />
                          </FormField>
                        )}
                      />

                      <Controller
                        control={control}
                        name={`measurement.${measurement.productField}Unit`}
                        render={({ field: { value, onChange } }) => (
                          <FormField label={`${measurement.name} enhet`}>
                            <SelectMeasurement
                              measurementType={measurementType}
                              value={value}
                              onChange={onChange}
                            />
                          </FormField>
                        )}
                      />
                    </div>
                  );
                })}

                <Controller
                  control={control}
                  name="documents"
                  render={({ field: { value, onChange } }) => (
                    <FormField
                      label="Dokument"
                      required={false}
                      error={errors.documents?.message}
                    >
                      <UploadDocument
                        files={value}
                        setFiles={onChange}
                        allowedFileNumber={10}
                      />
                    </FormField>
                  )}
                />
              </div>
            )}

            <Controller
              control={control}
              name="color.enabled"
              render={({ field: { value, onChange } }) => (
                <FormField
                  error={errors.secondaryMeasurement?.enabled?.message}
                >
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);

                      if (!checked) {
                        setValue("color", {
                          enabled: false,
                          value: undefined,
                          type: ColorTypeEnum.FreeText,
                        });
                      }
                    }}
                  >
                    Lägg till färg
                  </Checkbox>
                </FormField>
              )}
            />

            {watch("color.enabled") && (
              <div className="flex flex-col gap-2 rounded-md bg-neutral-100 p-4">
                <label className="text-label-large">Ange färgkod</label>
                <div className="flex flex-row gap-5">
                  <Controller
                    control={control}
                    name="color.value"
                    render={({ field }) => {
                      const placeholder =
                        watch("color.type") === ColorTypeEnum.Ncs
                          ? "S 3010-Y30R"
                          : "Grön";

                      return (
                        <FormField error={errors.color?.value?.message}>
                          <Input
                            {...field}
                            placeholder={placeholder}
                            size="middle"
                          />
                        </FormField>
                      );
                    }}
                  />

                  <Controller
                    control={control}
                    name="color.type"
                    render={({ field: { value, onChange } }) => (
                      <FormField error={errors.color?.type?.message}>
                        <SelectColorType value={value} onChange={onChange} />
                      </FormField>
                    )}
                  />
                </div>
              </div>
            )}
          </Section>

          <Section>
            <Controller
              control={control}
              name="project.hasProject"
              render={({ field: { value, onChange } }) => (
                <FormField error={errors.project?.hasProject?.message}>
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);
                      if (!checked) {
                        setValue("project.projectId", undefined);
                        clearErrors("project.projectId");
                      } else {
                        clearErrors("project.address");
                      }
                    }}
                  >
                    Koppla till ett projekt
                  </Checkbox>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name={"project.projectId"}
              render={({ field: { onChange } }) => (
                <FormField
                  label="Projekt"
                  error={errors.project?.projectId?.message}
                  required={watch("project.hasProject")}
                >
                  <SelectProject
                    sellerId={watch("sellerId")}
                    projectId={watch("project.projectId")}
                    disabled={!watch("project.hasProject")}
                    onSelectProject={onChange}
                  />
                </FormField>
              )}
            />
          </Section>

          <Section error={errors.transportation?.selected?.message}>
            <Controller
              control={control}
              name="transportation.pickup.enabled"
              render={({ field: { value, onChange } }) => (
                <FormField>
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);
                      if (checked) clearErrors("transportation.selected");
                    }}
                  >
                    Avhämtning
                  </Checkbox>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="transportation.shipping.enabled"
              render={({ field: { value, onChange } }) => (
                <FormField>
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);
                      if (checked) clearErrors("transportation.selected");
                    }}
                  >
                    Fraktleverans
                  </Checkbox>
                </FormField>
              )}
            />

            {watch("transportation.shipping.enabled") && (
              <Controller
                control={control}
                name="transportation.shipping.shippingPriceId"
                render={({ field: { value, onChange } }) => (
                  <FormField
                    label="Välj vikt på paketet"
                    required={true}
                    error={
                      errors.transportation?.shipping?.shippingPriceId?.message
                    }
                  >
                    <SelectShippingPrice value={value} onChange={onChange} />
                  </FormField>
                )}
              />
            )}

            <Controller
              control={control}
              name="transportation.delivery.enabled"
              render={({ field: { value, onChange } }) => (
                <FormField>
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(checked);
                      if (checked) clearErrors("transportation.selected");
                    }}
                  >
                    Hemtransport
                  </Checkbox>
                </FormField>
              )}
            />

            {watch("transportation.delivery.enabled") && (
              <>
                <Controller
                  control={control}
                  name="transportation.delivery.radius"
                  render={({ field }) => (
                    <FormField
                      label="Max avstånd för hemtransport (km)"
                      required={true}
                      error={errors.transportation?.delivery?.radius?.message}
                    >
                      <InputNumber
                        {...field}
                        style={{ width: "100%" }}
                        placeholder="Avstånd ..."
                        type="number"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name="transportation.delivery.price"
                  render={({ field }) => (
                    <FormField
                      label="Transportpris (kr)"
                      required={true}
                      error={errors.transportation?.delivery?.price?.message}
                    >
                      <InputNumber
                        {...field}
                        style={{ width: "100%" }}
                        placeholder="Transportpris ..."
                        type="number"
                      />
                    </FormField>
                  )}
                />
              </>
            )}
          </Section>
        </div>
      </div>
    </AdminForm>
  );
};

export default ProductForm;
