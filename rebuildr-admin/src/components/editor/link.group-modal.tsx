import React from "react";
import { Modal, Divider, Button, Input } from "antd";
import {
  LinkGroupSchema,
  LinkGroupSchemaType,
} from "@/schema/link-group-schema";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

type Props = {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (formData: LinkGroupSchemaType) => void;
  onDelete?: () => void;
  defaultValues: LinkGroupSchemaType;
};

const LinkGroupModal = ({
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
  } = useForm<LinkGroupSchemaType>({
    resolver: zodResolver(LinkGroupSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      afterOpenChange={() => reset(defaultValues, { keepDefaultValues: false })}
    >
      <AdminForm>
        <Divider orientation="left">{title}</Divider>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-4 rounded-[4px] bg-neutral-100 p-4"
          >
            <Controller
              control={control}
              name={`links.${index}.title`}
              render={({ field }) => (
                <FormField
                  label="Titel"
                  error={errors.links?.[index]?.title?.message}
                >
                  <Input {...field} placeholder="Titel ..." />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name={`links.${index}.description`}
              render={({ field }) => (
                <FormField
                  label="Beskrivning"
                  error={errors.links?.[index]?.description?.message}
                >
                  <Input {...field} placeholder="Beskrivning ..." />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name={`links.${index}.link`}
              render={({ field }) => (
                <FormField
                  label="Länk"
                  error={errors.links?.[index]?.link?.message}
                >
                  <Input {...field} placeholder="https://..." />
                </FormField>
              )}
            />

            <Button
              icon={<DeleteOutlined />}
              danger
              type="default"
              onClick={() => remove(index)}
              size="middle"
              block
            >
              Ta bort länken
            </Button>
          </div>
        ))}

        <Button
          icon={<PlusOutlined />}
          type="dashed"
          onClick={() => append({ title: "", description: "", link: "" })}
          block
        >
          Lägg till ny länk
        </Button>

        <Divider />

        <Button
          type="primary"
          htmlType="button"
          block
          onClick={handleSubmit(onSubmit)}
        >
          Spara gruppen
        </Button>

        {onDelete && (
          <Button
            htmlType="button"
            type="primary"
            danger
            block
            onClick={onDelete}
          >
            Radera gruppen
          </Button>
        )}
      </AdminForm>
    </Modal>
  );
};

export default LinkGroupModal;
