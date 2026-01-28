import React from "react";
import { notFound } from "next/navigation";
import { getBrand } from "@/queries/brand/get-brand";
import EditBrand from "@/components/brand/edit-brand";

type Props = {
  params: Promise<{ brandId: string }>;
};

const EditBrandPage = async ({ params }: Props) => {
  const { brandId } = await params;
  const brand = await getBrand(brandId);
  if (!brand) notFound();

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <EditBrand brand={brand} />
    </div>
  );
};

export default EditBrandPage;
