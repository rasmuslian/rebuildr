import React from "react";
import { getArticle } from "@/queries/article/get-article";
import { notFound } from "next/navigation";
import EditArticle from "@/components/article/edit-article";

type Props = {
  params: Promise<{ articleId: string }>;
};

const EditArticlePage = async ({ params }: Props) => {
  const { articleId } = await params;
  const article = await getArticle(articleId);
  if (!article) notFound();

  return <EditArticle article={article} />;
};

export default EditArticlePage;
