import React from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/queries/product/get-product";
import EditProduct from "@/components/product/edit-product";
import { ProductStatusEnum } from "gql/graphql";
import ForbiddenPage from "@/components/forbidden-page";

type Props = {
  params: Promise<{ productId: string }>;
};

const EditProductPage = async ({ params }: Props) => {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) notFound();

  if (product.status === ProductStatusEnum.Sold) {
    return (
      <ForbiddenPage
        status={"success"}
        title="Produkten är såld"
        subTitle="Den här produkten kan inte redigeras eftersom den redan är såld."
      />
    );
  }

  if (product.status === ProductStatusEnum.Deleted) {
    return (
      <ForbiddenPage
        status={"403"}
        title="Produkten har tagits bort"
        subTitle="Den här produkten kan inte redigeras eftersom den har raderats."
      />
    );
  }

  return <EditProduct product={product} />;
};

export default EditProductPage;
