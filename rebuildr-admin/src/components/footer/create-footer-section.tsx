"use client";

import React, { useState } from "react";
import {
  FooterSectionSchema,
  FooterSectionSchemaType,
} from "@/schema/footer-section-schema";
import { Modal, Button, App } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CmsCreateFooterSectionInput } from "gql/graphql";
import { createFooterSection } from "@/queries/footer/create-footer-section";
import { queryKeys } from "@/lib/query-keys";
import FooterSectionForm from "@components/footer/footer-section-form";

const CreateFooterSection = () => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FooterSectionSchemaType>({
    resolver: zodResolver(FooterSectionSchema),
    defaultValues: {
      articles: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsCreateFooterSectionInput) => {
      const response = await createFooterSection(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_FOOTER_SECTIONS],
      });
      notification.success({
        message: "Hurra!",
        description: "Sektionen har skapats!",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Sektionen kunde inte sparas.",
      });
    },
  });

  const onSubmit = (formData: FooterSectionSchemaType) => {
    const newFooterSection: CmsCreateFooterSectionInput = {
      title: formData.title,
      orderIndex: formData.orderIndex,
      articles: formData.articles.map((article, index) => ({
        articleId: article.id,
        orderIndex: index,
      })),
    };

    mutate(newFooterSection);
  };

  return (
    <div className="flex flex-col gap-5">
      <Button
        icon={<PlusCircleOutlined />}
        type="default"
        block
        onClick={() => setOpen(true)}
      >
        Lägg till ny sektion
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={false}
        width={1280}
        style={{ top: 10 }}
        afterClose={() => reset()}
      >
        <FooterSectionForm
          title="Skapa ny sektion"
          submitLabel="Publicera"
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          control={control}
          errors={errors}
          isPending={isPending}
        />
      </Modal>
    </div>
  );
};

export default CreateFooterSection;
