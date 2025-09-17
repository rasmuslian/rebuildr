"use client";

import ArticleForm from "@/components/article/article-form";
import { ArticleSchemaType, ArticleSchema } from "@/schema/article-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { createArticle } from "@/queries/article/create-article";
import { CmsCreateArticleInput } from "gql/graphql";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

const CreateArticle = () => {
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
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsCreateArticleInput) => {
      const response = await createArticle(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_ARTICLES] });
      notification.success({
        message: "Hurra!",
        description: "Artikeln har publicerats!",
      });
      router.push(routes.ARTICLE_LIST);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Artikeln kunde inte publiceras.",
      });
    },
  });

  const onSubmit = async (formData: ArticleSchemaType) => {
    const article: CmsCreateArticleInput = {
      title: formData.title ?? "",
      body: formData.body ?? "",
    };

    mutate(article);
  };

  return (
    <ArticleForm
      title="Skapa artikel"
      submitLabel="Publicera"
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      errors={errors}
      control={control}
      watch={watch}
      isPending={isPending}
    />
  );
};

export default CreateArticle;
