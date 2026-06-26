"use client";

import { Product } from "gql/graphql";
import React from "react";
import ProductForm from "@components/product/product-form";
import { ProductSchemaType, ProductSchema } from "@/schema/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { revalidate } from "@/actions/revalidate";
import {
  getFileInputTypes,
  getUploadFiles,
  getRemovedFileIds,
  uploadFiles,
} from "@utils/file-utils";
import { CmsUpdateProductInput } from "gql/graphql";
import { updateProduct } from "@/queries/product/update-product";
import { queryKeys } from "@/lib/query-keys";
import { productFieldMeasurementKeys } from "@/constants/measurements";
import { omit } from "lodash";

type Props = {
  product: Product;
};

const EditProduct = ({ product }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: product.title,
      description: product.description ?? "",
      brandId: product.brand?.id,
      categoryId: product.category?.id,
      condition: product.condition,
      pricing: {
        price: product.price,
        isGiveaway: product.isGiveaway,
      },
      searchAliases: product.searchAliases ?? [],
      searchRelatedTerms: product.searchRelatedTerms ?? [],
      searchUseCases: product.searchUseCases ?? [],
      color: {
        enabled: !!product.color,
        type: product.colorType,
        value: product.color ?? undefined,
      },
      images: product.images ? getUploadFiles(product.images) : [],
      documents: product.documents ? getUploadFiles(product.documents) : [],
      primaryMeasurement: {
        quantity: product.primaryQuantity ?? undefined,
        unit: product.primaryUnit ?? undefined,
      },
      secondaryMeasurement: {
        enabled: !!product.secondaryQuantity && !!product.secondaryUnit,
        quantity: product.secondaryQuantity ?? undefined,
        unit: product.secondaryUnit ?? undefined,
      },
      measurement: {
        enabled:
          productFieldMeasurementKeys.some((key) => Boolean(product[key])) ||
          product.documents.length > 0,

        ...Object.fromEntries(
          productFieldMeasurementKeys.flatMap((key) => [
            [key, product[key] ?? undefined],
            [`${key}Unit`, product[`${key}Unit`] ?? undefined],
          ]),
        ),
      },
      soldByQuantity: product.soldByQuantity ?? false,
      sellerId: product.sellerId,
      project: {
        hasProject: !product.noProject,
        projectId: product.project?.id,
        address: product.address ?? undefined,
      },
      transportation: {
        pickup: {
          enabled: product.pickupEnabled,
        },
        delivery: {
          enabled: product.deliveryEnabled,
          radius: product.deliveryRadius
            ? product.deliveryRadius / 1000
            : undefined,
          price: product.deliveryPrice,
        },
        shipping: {
          enabled: product.shippingPrices?.length
            ? product.shippingPrices.length > 0
            : false,
          shippingPriceId: product.shippingPrices?.length
            ? product.shippingPrices[0].id
            : undefined,
        },
      },
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateProductInput) => {
      const response = await updateProduct(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Hurra!",
        description: "Produkten har uppdaterats.",
      });
      await revalidate(`${routes.EDIT_PRODUCT}/${product.id}`);
      router.push(routes.LIST_PRODUCT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Produkten kunde inte uppdateras.",
      });
    },
  });

  const onSubmit = async (formData: ProductSchemaType) => {
    const { delivery, shipping, pickup } = formData.transportation;

    const updatedProduct: CmsUpdateProductInput = {
      id: product.id,
      title: formData.title,
      description: formData.description,
      searchAliases: formData.searchAliases,
      searchRelatedTerms: formData.searchRelatedTerms,
      searchUseCases: formData.searchUseCases,
      brandId: formData.brandId,
      categoryId: formData.categoryId,
      condition: formData.condition,
      price: formData.pricing.price ?? 0,
      color: formData.color.value ?? null,
      colorType: formData.color.type,
      isGiveaway: formData.pricing.isGiveaway,
      addImages: getFileInputTypes(formData.images),
      removeImages: getRemovedFileIds(product.images, formData.images),
      addDocuments: getFileInputTypes(formData.documents),
      removeDocuments: getRemovedFileIds(product.documents, formData.documents),
      primaryQuantity: formData.primaryMeasurement.quantity,
      primaryUnit: formData.primaryMeasurement.unit,
      secondaryQuantity: formData.secondaryMeasurement.quantity ?? null,
      secondaryUnit: formData.secondaryMeasurement.unit ?? null,
      measurement: Object.fromEntries(
        Object.entries(omit(formData.measurement, ["enabled"])).map(
          ([key, value]) => [key, value ?? null],
        ),
      ),
      noProject: !formData.project.hasProject,
      projectId: formData.project.projectId ?? null,
      address: formData.project.address ?? null,
      pickupEnabled: pickup.enabled,
      deliveryEnabled: delivery.enabled,
      deliveryPrice: delivery.price ?? undefined,
      deliveryRadius: delivery.radius ?? undefined,
      shippingPriceIds:
        shipping.enabled && shipping.shippingPriceId
          ? [shipping.shippingPriceId]
          : [],
      soldByQuantity: formData.soldByQuantity,
    };

    const response = await mutateAsync(updatedProduct);
    if (response.imagePutUrls) {
      await uploadFiles(response.imagePutUrls, formData.images);
    }
    if (response.documentPutUrls) {
      await uploadFiles(response.documentPutUrls, formData.documents);
    }
  };

  return (
    <ProductForm
      title="Redigera produkt"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="Spara"
      watch={watch}
      setValue={setValue}
      clearErrors={clearErrors}
    />
  );
};

export default EditProduct;
