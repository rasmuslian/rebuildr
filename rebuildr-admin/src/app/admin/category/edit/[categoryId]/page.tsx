import React from "react";
import { notFound } from "next/navigation";
import { getCategory } from "@/queries/category/get-category";
import EditCategory from "@/components/category/edit-category";

type Props = {
  params: Promise<{ categoryId: string }>;
};

const EditCategoryPage = async ({ params }: Props) => {
  const { categoryId } = await params;
  const category = await getCategory({ id: categoryId });
  if (!category) notFound();

  return <EditCategory category={category} />;
};

export default EditCategoryPage;
