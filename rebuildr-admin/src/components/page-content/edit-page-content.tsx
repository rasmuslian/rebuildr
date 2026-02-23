"use client";

import React from "react";
import { PageContent, UpdatePageContentInput } from "gql/graphql";
import {
  PageContentSchema,
  PageContentSchemaType,
} from "@/schema/page-content-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import AdminForm from "@components/admin-form";
import { Button, App } from "antd";
import FormField from "@components/form-field";
import TextEditor from "@/components/editor/text-editor";
import { updatePageContent } from "@/queries/page-content/update-page-content";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { queryKeys } from "@/lib/query-keys";
import { revalidate } from "@/actions/revalidate";
import HtmlPreview from "@components/article/html-preview";
import { Controller } from "react-hook-form";
import { getPageContentName } from "@/utils/page-content-utils";

type Props = {
  pageContent: PageContent;
};

const EditPageContent = ({ pageContent }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PageContentSchemaType>({
    resolver: zodResolver(PageContentSchema),
    defaultValues: {
      heorHtml: pageContent.heroHtml,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: UpdatePageContentInput) => {
      const response = await updatePageContent(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_PAGE_CONTENTS],
      });
      notification.success({
        message: "Hurra!",
        description: "Sidan har sparats!",
      });
      await revalidate(`${routes.EDIT_PAGE_CONTENT}/${pageContent.id}`);
      router.push(routes.LIST_PAGE_CONTENT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Sidan kunde inte sparas.",
      });
    },
  });

  const onSubmit = async (formData: PageContentSchemaType) => {
    const input: UpdatePageContentInput = {
      id: pageContent.id,
      heroHtml: formData.heorHtml,
    };

    mutate(input);
  };

  return (
    <AdminForm
      title={`${getPageContentName(pageContent.page)}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid max-w-screen-2xl grid-cols-[auto_375px] gap-5">
        <div className="flex flex-col gap-5">
          <Controller
            control={control}
            name="heorHtml"
            render={({ field: { value, onChange } }) => (
              <FormField label="Startsektion" error={errors.heorHtml?.message}>
                <TextEditor
                  height={500}
                  value={value}
                  setValue={onChange}
                  placeholder="Börja skriva din start sektion ..."
                />
              </FormField>
            )}
          />

          <Button type="primary" htmlType="submit" loading={isPending}>
            Spara
          </Button>
        </div>

        <HtmlPreview html={watch("heorHtml") ?? ""} />
      </div>
    </AdminForm>
  );
};

export default EditPageContent;
