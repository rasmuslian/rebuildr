import { Divider } from "antd";
import React from "react";
import { listCategories } from "@/queries/category/list-categories";
import CategoryTree from "@/components/category/category-tree";
import { notFound } from "next/navigation";

const CategoriesPage = async () => {
  const categories = await listCategories();
  if (!categories) notFound();

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <Divider orientation="left">Alla kategorier</Divider>
      <CategoryTree categories={categories} />
    </div>
  );
};

export default CategoriesPage;
