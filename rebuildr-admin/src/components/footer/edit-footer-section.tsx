"use client";

import React from "react";
import { FooterSection } from "gql/graphql";
import { App, Modal } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  FooterSectionSchema,
  FooterSectionSchemaType,
} from "@/schema/footer-section-schema";
import { queryKeys } from "@/lib/query-keys";
import FooterSectionForm from "@components/footer/footer-section-form";
import { CmsUpdateFooterSectionInput } from "gql/graphql";
import { updateFooterSection } from "@/queries/footer/update-footer-section";

type Props = {
  open: boolean;
  onCancel: () => void;
  footerSection: FooterSection;
};

const getDefaultValues = (
  footerSection: FooterSection,
): FooterSectionSchemaType => ({
  title: footerSection.title,
  orderIndex: footerSection.orderIndex,
  articles: footerSection.articleFooterSections.map((fs) => fs.article),
});

const EditFooterSection = ({ open, onCancel, footerSection }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FooterSectionSchemaType>({
    resolver: zodResolver(FooterSectionSchema),
    defaultValues: getDefaultValues(footerSection),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateFooterSectionInput) => {
      const response = await updateFooterSection(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      onCancel();
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_FOOTER_SECTIONS],
      });
      notification.success({
        message: "Hurra!",
        description: "Sektionen har updaterats!",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Sektionen kunde inte updateras.",
      });
    },
  });

  const onSubmit = (formData: FooterSectionSchemaType) => {
    const updatedFooterSection: CmsUpdateFooterSectionInput = {
      id: footerSection.id,
      title: formData.title,
      orderIndex: formData.orderIndex,
      articles: formData.articles.map((article, index) => ({
        articleId: article.id,
        orderIndex: index,
      })),
    };

    mutate(updatedFooterSection);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={false}
      width={1280}
      style={{ top: 10 }}
      afterOpenChange={() => {
        reset(getDefaultValues(footerSection), { keepDefaultValues: false });
      }}
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
  );
};

export default EditFooterSection;
