"use client";

import React from "react";
import ProductForm from "@components/product/product-form";
import { ProductSchemaType, ProductSchema } from "@/schema/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { getFileInputTypes, uploadFiles } from "@utils/medial-utils";
import { CmsCreateProductInput, MeasurementUnitEnum } from "gql/graphql";
import { createProduct } from "@/queries/product/create-product";
import { queryKeys } from "@/lib/query-keys";
import { omit } from "lodash";

const CreateProduct = () => {
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
      images: [],
      documents: [],
      pricing: {
        isGiveaway: false,
      },
      secondaryMeasurement: {
        enabled: false,
      },
      measurement: {
        enabled: false,
        thicknessUnit: MeasurementUnitEnum.Mm,
        heightUnit: MeasurementUnitEnum.Mm,
        widthUnit: MeasurementUnitEnum.Mm,
        diameterUnit: MeasurementUnitEnum.Mm,
        lengthUnit: MeasurementUnitEnum.Mm,
        weightUnit: MeasurementUnitEnum.Kg,
      },
      project: {
        hasProject: false,
      },
      transportation: {
        pickup: {
          enabled: false,
        },
        delivery: {
          enabled: false,
        },
        shipping: {
          enabled: false,
        },
      },
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CmsCreateProductInput) => {
      const response = await createProduct(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_PRODUCTS] });
      notification.success({
        message: "Hurra!",
        description: "Produkten har skapats.",
      });
      router.push(routes.LIST_PRODUCT);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Produkten kunde inte skapas.",
      });
    },
  });

  const onSubmit = async (formData: ProductSchemaType) => {
    const { delivery, shipping, pickup } = formData.transportation;

    const newProduct: CmsCreateProductInput = {
      title: formData.title,
      description: formData.description,
      brandId: formData.brandId,
      categoryId: formData.categoryId,
      condition: formData.condition,
      price: formData.pricing.price ?? 0,
      isGiveaway: formData.pricing.isGiveaway,
      images: getFileInputTypes(formData.images),
      documents: getFileInputTypes(formData.documents),
      primaryQuantity: formData.primaryMeasurement.quantity,
      primaryUnit: formData.primaryMeasurement.unit,
      secondaryQuantity: formData.secondaryMeasurement.quantity,
      secondaryUnit: formData.secondaryMeasurement.unit,
      measurement: omit(formData.measurement, ["enabled"]),
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
    };

    const response = await mutateAsync(newProduct);
    if (response.imagePutUrls) {
      await uploadFiles(response.imagePutUrls, formData.images);
    }
    if (response.documentPutUrls) {
      await uploadFiles(response.documentPutUrls, formData.documents);
    }
  };

  return (
    <ProductForm
      title="Skapa produkt"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="Publicera"
      watch={watch}
      setValue={setValue}
      clearErrors={clearErrors}
    />
  );
};

export default CreateProduct;
