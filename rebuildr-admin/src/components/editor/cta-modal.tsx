import React from "react";
import { Modal, Divider, Button, Input } from "antd";
import { CTASchema, CTASchemaType } from "@/schema/cta-schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { DeleteOutlined } from "@ant-design/icons";

type Props = {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (formData: CTASchemaType) => void;
  onDelete?: () => void;
  defaultValues: CTASchemaType;
};

const CTAModal = ({
  title,
  open,
  onCancel,
  onSubmit,
  defaultValues,
  onDelete,
}: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CTASchemaType>({
    resolver: zodResolver(CTASchema),
    defaultValues,
  });

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={false}
      width={980}
      afterOpenChange={() => reset(defaultValues, { keepDefaultValues: false })}
    >
      <AdminForm>
        <Divider orientation="left">{title}</Divider>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <FormField label="Rubrik" error={errors.title?.message}>
              <Input {...field} placeholder="Rubrik..." />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormField label="Beskrivning" error={errors.description?.message}>
              <Input.TextArea
                {...field}
                rows={5}
                placeholder="Beskrivning ..."
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="button.label"
          render={({ field }) => (
            <FormField label="CTA label" error={errors.button?.label?.message}>
              <Input {...field} placeholder="label..." />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="button.link"
          render={({ field }) => (
            <FormField label="CTA länk" error={errors.button?.link?.message}>
              <Input {...field} placeholder="https://..." />
            </FormField>
          )}
        />

        <Button
          type="primary"
          htmlType="button"
          size="middle"
          onClick={handleSubmit(onSubmit)}
        >
          Spara
        </Button>

        {onDelete && (
          <Button
            icon={<DeleteOutlined />}
            htmlType="button"
            size="middle"
            danger
            type="primary"
            onClick={onDelete}
          >
            Radera
          </Button>
        )}
      </AdminForm>
    </Modal>
  );
};

export default CTAModal;
