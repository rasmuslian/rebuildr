import React from "react";
import { UserSchemaType } from "@/schema/user-schema";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import { Checkbox, Button, Input } from "antd";
import SelectAddress from "@components/address/select-address";
import { UserType } from "gql/graphql";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<UserSchemaType>;
  onSubmit: (formValues: UserSchemaType) => void;
  errors: FieldErrors<UserSchemaType>;
  control: Control<UserSchemaType>;
  submitLabel: string;
  isPending: boolean;
  userType?: UserType;
};

const UserForm = ({
  title,
  onSubmit,
  handleSubmit,
  errors,
  control,
  submitLabel,
  isPending,
  userType,
}: Props) => {
  const isBusinessUser = userType === UserType.Business;
  return (
    <AdminForm title={title} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormField label="Namn" error={errors.name?.message}>
            <Input {...field} placeholder="Namn" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <FormField label="Telefonnummer" error={errors.phoneNumber?.message}>
            <Input {...field} placeholder="Telefonnummer" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field }) => (
          <FormField label="Stad" error={errors.city?.message}>
            <Input {...field} placeholder="Stad" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="postCode"
        render={({ field }) => (
          <FormField label="Postnummer" error={errors.postCode?.message}>
            <Input {...field} placeholder="Postnummer" />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name={"address"}
        render={({ field: { value, onChange } }) => (
          <FormField label="Adress" error={errors.address?.message}>
            <SelectAddress value={value} onChange={onChange} />
          </FormField>
        )}
      />

      {isBusinessUser && (
        <Controller
          control={control}
          name="websiteUrl"
          render={({ field }) => (
            <FormField label="Webbplats" error={errors.websiteUrl?.message}>
              <Input {...field} placeholder="https://" />
            </FormField>
          )}
        />
      )}

      {isBusinessUser && (
        <Controller
          control={control}
          name="isFeatured"
          render={({ field: { value, onChange } }) => (
            <FormField error={errors.isFeatured?.message}>
              <label className="flex items-center gap-2 text-label-large">
                <Checkbox
                  checked={value}
                  onChange={(event) => onChange(event.target.checked)}
                />
                RebuildR Hub
              </label>
            </FormField>
          )}
        />
      )}

      <Controller
        control={control}
        name="isAdmin"
        render={({ field: { value, onChange } }) => (
          <FormField error={errors.isAdmin?.message}>
            <Checkbox checked={value} onChange={onChange}>
              Admin
            </Checkbox>
          </FormField>
        )}
      />

      <Button type="primary" htmlType="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default UserForm;
