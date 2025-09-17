"use client";

import { Article } from "gql/graphql";
import React from "react";

import ArticleForm from "@/components/article/article-form";
import { ArticleSchemaType, ArticleSchema } from "@/schema/article-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { CmsUpdateArticleInput } from "gql/graphql";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { updateArticle } from "@/queries/article/update-article";
import { revalidateCache } from "@/actions/revalidate-cache";

type Props = {
  article: Article;
};

const EditArticle = ({ article }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleSchemaType>({
    resolver: zodResolver(ArticleSchema),
    defaultValues: {
      title: article.title ?? "",
      body: article.body ?? "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateArticleInput) => {
      const response = await updateArticle(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_ARTICLES],
      });
      notification.success({
        message: "Hurra!",
        description: "Artikeln har sparats!",
      });
      await revalidateCache(`${routes.EDIT_ARTICLE}/${article.id}`);
      router.push(routes.ARTICLE_LIST);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Artikeln kunde inte sparas.",
      });
    },
  });

  const onSubmit = async (formData: ArticleSchemaType) => {
    const updatedArticle: CmsUpdateArticleInput = {
      id: article.id,
      title: formData.title ?? "",
      body: formData.body ?? "",
    };

    mutate(updatedArticle);
  };

  return (
    <ArticleForm
      title="Redigera artikel"
      submitLabel="Spara"
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      errors={errors}
      control={control}
      watch={watch}
      isPending={isPending}
    />
  );
};

export default EditArticle;
