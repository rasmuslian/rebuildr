import React from "react";
import { notFound } from "next/navigation";
import EditPageContent from "@/components/page-content/edit-page-content";
import { getPageContent } from "@/queries/page-content/get-page-content";

type Props = {
  params: Promise<{ pageContentId: string }>;
};

const EditPageContentPage = async ({ params }: Props) => {
  const { pageContentId } = await params;
  const pageContent = await getPageContent(pageContentId);
  if (!pageContent) notFound();
  return <EditPageContent pageContent={pageContent} />;
};

export default EditPageContentPage;
