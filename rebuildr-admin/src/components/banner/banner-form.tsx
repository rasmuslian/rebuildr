"use client";

import React from "react";
import { Button, DatePicker, Input, Radio, Select } from "antd";
import { Controller, useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import UploadImage from "@components/file/upload-image";
import { BannerSchemaType } from "@/schema/banner-schema";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<BannerSchemaType>;
  onSubmit: (formValues: BannerSchemaType) => void;
  errors: FieldErrors<BannerSchemaType>;
  control: Control<BannerSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const presetBackgroundOptions = [
  { label: "RebuildR", value: "REBUILDR" },
  { label: "Trä", value: "WOOD" },
  { label: "Metall", value: "METALLIC" },
];

const actionOptions = [{ label: "Sälj", value: "SELL" }];

const foregroundColorOptions = [
  { label: "Logotyp bakgrund", value: "LOGO_BACKGROUND", color: "#F8F1E3" },
  { label: "Logotyp vektor", value: "LOGO_VECTOR", color: "#00493E" },
  { label: "Vit", value: "WHITE", color: "#FFFFFF" },
  { label: "Mörkgrå", value: "CHARCOAL", color: "#1E1E1E" },
].map(({ label, value, color }) => ({
  value,
  label: (
    <span style={{ alignItems: "center", display: "flex", gap: 8 }}>
      <span
        style={{
          backgroundColor: color,
          border: "1px solid #AEAEAE",
          borderRadius: "50%",
          height: 16,
          width: 16,
        }}
      />
      {label}
    </span>
  ),
}));

const placementOptions = [
  { label: "Standard", value: "STANDARD" },
  { label: "Slutbanner", value: "END" },
  { label: "Produkt inline", value: "PRODUCT_INLINE" },
];

const BannerForm = ({
  title,
  onSubmit,
  handleSubmit,
  errors,
  control,
  submitLabel,
  isPending,
}: Props) => {
  const destinationType = useWatch({ control, name: "destinationType" });
  const placements = useWatch({ control, name: "placements" });
  const hasCtaPlacement = placements?.some((placement) =>
    ["END", "PRODUCT_INLINE"].includes(placement),
  );

  return (
    <AdminForm title={title} type="raised" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="label"
        render={({ field }) => (
          <FormField label="Label" error={errors.label?.message}>
            <Input {...field} placeholder="T.ex. RebuildR hub" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField label="Titel" error={errors.title?.message} required>
            <Input {...field} placeholder="T.ex. Hitta en hub nära dig" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="placements"
        render={({ field }) => (
          <FormField
            label="Placeringar"
            error={errors.placements?.message}
            required
          >
            <Select
              {...field}
              mode="multiple"
              options={placementOptions}
              placeholder="Välj var bannern ska visas"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="presetBackground"
        render={({ field }) => (
          <FormField
            label="Förvald bakgrund"
            error={errors.presetBackground?.message}
          >
            <Select
              {...field}
              options={presetBackgroundOptions}
              placeholder="Välj bakgrund"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="foregroundColor"
        render={({ field }) => (
          <FormField
            label="Textfärg"
            error={errors.foregroundColor?.message}
            required
          >
            <Select
              {...field}
              options={foregroundColorOptions}
              placeholder="Välj textfärg"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="backgroundImage"
        render={({ field: { value, onChange } }) => (
          <FormField
            label="Bakgrundsbild"
            error={errors.backgroundImage?.message}
            description="Gäller framför förvald bakgrund om angiven"
          >
            <UploadImage files={value} setFiles={onChange} aspectSlider />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="logo"
        render={({ field: { value, onChange } }) => (
          <FormField label="Logotyp" error={errors.logo?.message}>
            <UploadImage files={value} setFiles={onChange} crop={false} />
          </FormField>
        )}
      />

      {hasCtaPlacement && (
        <Controller
          control={control}
          name="ctaText"
          render={({ field }) => (
            <FormField label="CTA-text" error={errors.ctaText?.message}>
              <Input {...field} placeholder="T.ex. Läs mer" />
            </FormField>
          )}
        />
      )}

      <Controller
        control={control}
        name="destinationType"
        render={({ field }) => (
          <FormField label="Destination">
            <Radio.Group {...field}>
              <Radio value="none">Ingen</Radio>
              <Radio value="url">URL</Radio>
              <Radio value="action">Action</Radio>
            </Radio.Group>
          </FormField>
        )}
      />

      {destinationType === "url" && (
        <Controller
          control={control}
          name="url"
          render={({ field }) => (
            <FormField label="URL" error={errors.url?.message} required>
              <Input {...field} placeholder="https://" />
            </FormField>
          )}
        />
      )}

      {destinationType === "action" && (
        <Controller
          control={control}
          name="action"
          render={({ field }) => (
            <FormField label="Action" error={errors.action?.message} required>
              <Select
                {...field}
                options={actionOptions}
                placeholder="Välj action"
              />
            </FormField>
          )}
        />
      )}

      <Controller
        control={control}
        name="showFrom"
        render={({ field }) => (
          <FormField
            label="Visa från"
            error={errors.showFrom?.message as string}
            required
          >
            <DatePicker {...field} style={{ width: "100%" }} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="showTo"
        render={({ field }) => (
          <FormField
            label="Visa till"
            error={errors.showTo?.message as string}
            description="Lämna tomt för att visa tills vidare"
          >
            <DatePicker
              {...field}
              value={field.value ?? null}
              style={{ width: "100%" }}
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

export default BannerForm;
