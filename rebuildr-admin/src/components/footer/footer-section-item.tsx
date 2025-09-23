"use client";

import React, { useState } from "react";
import { FooterSection } from "gql/graphql";
import Section from "@components/section";
import ArticleFooterSectionItem from "@components/footer/article-footer-section-item";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Modal, App } from "antd";
import EditFooterSection from "@components/footer/edit-footer-section";
import { deleteFooterSection } from "@/queries/footer/delete-footer-section";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

type Props = {
  footerSection: FooterSection;
};

const FooerSectionItem = ({ footerSection }: Props) => {
  const [open, setOpen] = useState(false);
  const { notification, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { id, orderIndex, title } = footerSection;

  const { mutate, isPending } = useMutation({
    mutationFn: async (footerSectionId: string) => {
      const response = await deleteFooterSection(footerSectionId);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_FOOTER_SECTIONS],
      });
      notification.success({
        message: "Hurra!",
        description: "Sektionen har raderats!",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Sektionen kunde inte raderas.",
      });
    },
  });

  const confirmDelete = (title: string, id: string) => {
    modal.confirm({
      title: 'Säker på att du vill ta bort "' + title + '"?',
      content:
        "När du raderar sektionen kommer den inte längre vara tillgänglig och kan inte återställas.",
      async onOk() {
        mutate(id);
      },
      okText: "Radera",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Avbryt",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Section>
        <div className="flex flex-row justify-between gap-5">
          <div className="flex flex-row gap-3 text-title-medium text-neutral-400">
            <span>{`#${orderIndex}`}</span>
            <span>{title}</span>
          </div>
          <div className="flex flex-row gap-4">
            <Button
              icon={<DeleteOutlined />}
              loading={isPending}
              type="dashed"
              onClick={() => confirmDelete(title, id)}
            />
            <Button
              icon={<EditOutlined />}
              type="dashed"
              onClick={() => setOpen(true)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {footerSection.articleFooterSections.map((articleFooterSection) => (
            <ArticleFooterSectionItem
              key={articleFooterSection.articleId}
              articleFooterSection={articleFooterSection}
            />
          ))}
        </div>
      </Section>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={false}
        width={980}
      >
        <EditFooterSection
          footerSection={footerSection}
          afterSuccess={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default FooerSectionItem;
