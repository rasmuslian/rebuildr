import {
  QuantityUnitEnum,
  ProductConditionEnum,
  ShippingProviderEnum,
  File as GqlFile,
  ProductStatusEnum,
  UpsertProductBottomSheetQuery,
  UpsertProductBottomSheetQueryVariables,
  UpsertProductUpdateProductMutation,
  UpsertProductUpdateProductMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { FileType } from "@components/product/types";
import { useEffect, useState } from "react";
import { ProgressHeader } from "@components/product/progress-header";
import { Project } from "./project";
import { Transportation } from "./transportation";
import { Preview } from "./preview";
import { View } from "react-native";
import { HandleDraftBottomSheet } from "../sell-product/handle-draft-bottom-sheet";
import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { PayoutHandler } from "../sell-product/payout-handler";
import { Details } from "./details";
import { UPSERT_PRODUCT_PRODUCT_FRAGMENT } from "./queries";

export type ProductFields = {
  //initial
  categoryIds?: string[];
  title?: string;
  description?: string;
  price?: number;
  primaryQuantity?: number;
  primaryUnit?: QuantityUnitEnum;
  secondaryQuantity?: number;
  secondaryUnit?: QuantityUnitEnum;
  thickness?: number;
  height?: number;
  width?: number;
  length?: number;
  diameter?: number;
  weight?: number;
  isGiveaway?: boolean;
  condition: ProductConditionEnum;
  brandId?: string | null;
  images?: FileType[];
  documents?: FileType[];
  minimumPrice?: number;

  //project
  noProject?: boolean;
  project?: {
    id: string;
  };

  //transportation
  pickupEnabled: boolean;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  approximatePlace?: {
    lat: number;
    lng: number;
    address: string;
  };

  shippingPrices: {
    id: string;
    maxWeight: number;
    price: number;
    provider: ShippingProviderEnum;
  }[];

  deliveryRadius?: number;
  deliveryPrice?: number;
  deliveryEnabled: boolean;

  status: ProductStatusEnum;
};

export const initialProduct: ProductFields = {
  //initial
  categoryIds: undefined,
  title: undefined,
  description: undefined,
  price: undefined,
  primaryQuantity: undefined,
  primaryUnit: undefined,
  secondaryQuantity: undefined,
  secondaryUnit: undefined,
  thickness: undefined,
  height: undefined,
  width: undefined,
  length: undefined,
  diameter: undefined,
  weight: undefined,
  isGiveaway: undefined,
  condition: ProductConditionEnum.Good,
  brandId: undefined,
  images: undefined,
  documents: undefined,
  minimumPrice: undefined,

  //project
  noProject: undefined,
  project: undefined,

  //transportation
  pickupEnabled: false,
  address: undefined,
  location: undefined,
  approximatePlace: undefined,
  shippingPrices: [],
  deliveryRadius: 3000,
  deliveryPrice: 0,
  deliveryEnabled: false,

  status: ProductStatusEnum.Draft,
};

export const UPSERT_PRODUCT_BOTTOM_SHEET = gql`
  query UpsertProductBottomSheet($input: GetProductInput!) {
    product(input: $input) {
      ...UpsertProductProductFragment
    }
    me {
      id
      selectedPayoutMethod
    }
  }
  ${UPSERT_PRODUCT_PRODUCT_FRAGMENT}
`;

const UPSERT_PRODUCT_UPDATE_PRODUCT = gql`
  mutation UpsertProductUpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        ...UpsertProductProductFragment
      }
      imagePutUrls
      documentPutUrls
    }
  }
  ${UPSERT_PRODUCT_PRODUCT_FRAGMENT}
`;

type FieldErrorsType = { [key in string]: string };
const detailsErrorFields = [
  "images",
  "price",
  "title",
  "description",
  "primary",
];

type Props = {
  productId: string;
  mode: "create" | "edit";
  visible: boolean;
  onHide: () => void;
};

export const UpsertProductBottomSheet = ({
  productId,
  mode,
  visible,
  onHide,
}: Props) => {
  const [product, setProduct] = useState<ProductFields>(initialProduct);
  const [step, setStep] = useState<
    "details" | "project" | "transportation" | "preview" | "payout"
  >("details");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showHandleDraft, setShowHandleDraft] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsType>();

  //progress
  const [projectProgress, setProjectProgress] = useState<number | undefined>(
    undefined,
  );
  const [transportationProgress, setTransportationProgress] = useState<
    number | undefined
  >(undefined);

  const { data } = useQuery<
    UpsertProductBottomSheetQuery,
    UpsertProductBottomSheetQueryVariables
  >(UPSERT_PRODUCT_BOTTOM_SHEET, { variables: { input: { id: productId } } });
  const [updateProduct, { loading: updatingProduct }] = useMutation<
    UpsertProductUpdateProductMutation,
    UpsertProductUpdateProductMutationVariables
  >(UPSERT_PRODUCT_UPDATE_PRODUCT);

  useEffect(() => {
    const productToState = async (
      dbProduct: NonNullable<UpsertProductBottomSheetQuery["product"]>,
    ) => {
      const convertDbFiles = async (files: GqlFile[]) => {
        return await Promise.all(
          files.map(async (file, index) => {
            const uri = file.url;
            const imageExt = uri.split(".").pop();
            const blob = await fetch(uri).then((res) => res.blob());
            const imageData = new File([blob], `${Date.now()}.${imageExt}`);
            return {
              id: file.id,
              uri: file.url,
              index,
              mimeType: file.mimeType,
              file: imageData,
              size: blob.size,
              name: file.name,
            };
          }),
        );
      };
      const dbImages = await convertDbFiles(dbProduct.images);
      const images = dbImages.reduce(
        (images, image) => {
          if (images.some((i) => i.id === image.id)) {
            return images;
          }
          return [...images, image];
        },
        [...(product?.images ?? [])],
      );

      const documents = await convertDbFiles(dbProduct.documents);

      const stateProduct: ProductFields = {
        //details
        categoryIds: dbProduct?.category
          ? [...dbProduct?.category.ancestorIds, dbProduct?.category.id]
          : [],
        title: dbProduct?.title ?? undefined,
        description: dbProduct?.description ?? undefined,
        price: dbProduct?.price,
        primaryQuantity: dbProduct?.primaryQuantity ?? undefined,
        primaryUnit: dbProduct?.primaryUnit ?? undefined,
        secondaryQuantity: dbProduct?.secondaryQuantity ?? undefined,
        secondaryUnit: dbProduct?.secondaryUnit ?? undefined,
        thickness: dbProduct?.thickness ?? undefined,
        height: dbProduct?.height ?? undefined,
        width: dbProduct?.width ?? undefined,
        length: dbProduct?.length ?? undefined,
        diameter: dbProduct?.diameter ?? undefined,
        weight: dbProduct?.weight ?? undefined,
        isGiveaway: dbProduct?.isGiveaway,
        condition: dbProduct?.condition,
        brandId: dbProduct?.brand ? dbProduct?.brand.id : undefined,
        images: images.length ? images : undefined,
        documents: documents.length ? documents : undefined,

        //project
        project: dbProduct.project
          ? {
              ...dbProduct.project,
            }
          : undefined,
        noProject: dbProduct.noProject ?? undefined,

        //transportation
        address: dbProduct.address ?? undefined,
        location: dbProduct.location ?? undefined,
        approximatePlace: dbProduct.approximatePlace ?? undefined,
        pickupEnabled: dbProduct.pickupEnabled,
        deliveryEnabled: dbProduct.deliveryEnabled,
        deliveryPrice: dbProduct.deliveryPrice ?? 0,
        deliveryRadius: dbProduct.deliveryRadius ?? undefined,
        shippingPrices: dbProduct.shippingPrices ?? [],

        status: dbProduct.status ?? product.status,
      };
      setProduct(stateProduct);
    };
    if (data) {
      //check if user has payout account
      if (!data.me.selectedPayoutMethod && mode === "create") {
        setStep("payout");
      }
      //convert to productState
      productToState(data.product);
    }
  }, [data]);

  //Find the first step that contains errors
  const firstStepWithErrors = (errorFields: FieldErrorsType) => {
    const errorInDetails = Object.keys(errorFields).some((key) =>
      detailsErrorFields.some((field) => field === key),
    );
    if (errorInDetails) {
      setStep("details");
    }
  };

  const onSave = (published: boolean) => {
    if (!data) {
      return;
    }
    const addFiles = (newFiles?: FileType[], currentFiles?: GqlFile[]) => {
      return (
        newFiles
          //Only add files that are not already on Product
          ?.filter((file) => {
            if (file.id === undefined || !currentFiles) {
              return true;
            }

            return currentFiles.every((i) => i.id !== file.id);
          })
          .map((file) => ({
            mimeType: file.mimeType,
            name: file.name,
          }))
      );
    };
    const removeFiles = (newFiles?: FileType[], currentFiles?: GqlFile[]) => {
      return currentFiles
        ?.filter((image) =>
          //Delete existing product's file if it does not exist in edited product
          newFiles?.every((selectedImage) => selectedImage.id !== image.id),
        )
        .map((image) => image.id as string);
    };

    updateProduct({
      variables: {
        input: {
          id: data.product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          primaryQuantity: product.primaryQuantity,
          primaryUnit: product.primaryUnit,
          secondaryQuantity: product.secondaryQuantity ?? null,
          secondaryUnit: product.secondaryUnit ?? null,
          thickness: product.thickness,
          height: product.height,
          width: product.width,
          length: product.length,
          diameter: product.diameter,
          weight: product.weight,
          isGiveAway: product.isGiveaway,
          categoryId: product.categoryIds
            ? (product.categoryIds.at(-1) ?? null)
            : undefined,
          brandId: product.brandId,
          condition: product.condition,
          addImages: addFiles(product.images, data.product.images),
          removeImages: removeFiles(product.images, data.product.images),
          addDocuments: addFiles(product.documents, data.product.documents),
          removeDocuments: removeFiles(
            product.documents,
            data.product.documents,
          ),

          status: published ? ProductStatusEnum.Published : undefined,
        },
      },
      onCompleted: async (data) => {
        let mediaPromises: Promise<void>[] = [];
        if (data.updateProduct.imagePutUrls) {
          mediaPromises = [
            ...mediaPromises,
            ...data.updateProduct.imagePutUrls.map(async (putUrl, index) => {
              const image = product.images?.[index];
              if (image) {
                await fetch(putUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type": image.mimeType,
                    "x-amz-acl": "public-read",
                  },
                  body: image.file,
                });
              }
            }),
          ];
        }
        if (data.updateProduct.documentPutUrls) {
          mediaPromises = [
            ...mediaPromises,
            ...data.updateProduct.documentPutUrls.map(async (putUrl, index) => {
              const doc = product.documents?.[index];
              if (doc) {
                await fetch(putUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type": doc.mimeType,
                    "x-amz-acl": "public-read",
                  },
                  body: doc.file,
                });
              }
            }),
          ];
        }
        if (mediaPromises.length) {
          setUploadingMedia(true);
          await Promise.all(mediaPromises);
          setUploadingMedia(false);
        }
        if (published) {
          onFinish();
        } else {
          onHide();
          setShowHandleDraft(false);
        }
      },
      onError: (error) => {
        const apolloErrors = error ? apolloBadFieldsError(error) : [];
        const badFields: FieldErrorsType =
          apolloErrors?.reduce(
            (acc: FieldErrorsType, curr) => ({
              ...acc,
              [curr.name]: curr.message,
            }),
            {},
          ) ?? {};

        firstStepWithErrors(badFields);
        setFieldErrors(badFields);
      },
    });
  };

  const progressDetails = () => {
    if (!product) {
      return 0;
    }

    const totalMandatories = 7;
    let obligatories = 0;
    if (product.images?.length) {
      obligatories += 1;
    }
    if (product.price || product.isGiveaway) {
      obligatories += 1;
    }
    if (product.title) {
      obligatories += 1;
    }
    if (product.description) {
      obligatories += 1;
    }
    if (product?.primaryQuantity && product.primaryUnit) {
      obligatories += 1;
    }
    if (product.condition) {
      obligatories += 1;
    }
    if (product.brandId) {
      obligatories += 1;
    }

    return Math.round((obligatories / totalMandatories) * 100);
  };

  const onDismissSheet = () => {
    if (mode === "edit") {
      onFinish();
      return;
    }
    if (step === "payout") {
      onHide();
      return;
    }
    //Check if we should prompt draft saving sheet
    if (step === "details") {
      const saveDraft =
        !!product.title ||
        product.isGiveaway ||
        !!product.price ||
        !!product.description ||
        product.images?.length ||
        !!product.primaryQuantity ||
        !!product.brandId;
      if (!saveDraft) {
        onFinish();
        return;
      }
    }
    setShowHandleDraft(true);
  };
  const onUpdateProduct = (partialProduct: Partial<ProductFields>) => {
    setProduct({ ...product, ...partialProduct });
  };
  const onVerifyDetails = () => {
    const badFields: FieldErrorsType = { ...fieldErrors };

    // reset details fields
    delete badFields["images"];
    delete badFields["price"];
    delete badFields["title"];
    delete badFields["description"];
    delete badFields["primary"];
    if (!product.images?.length) {
      badFields["images"] = "Måste bifoga minst en bild";
    }
    if (product.price !== undefined && !product.isGiveaway) {
      if (product.price <= 0) {
        badFields["price"] = "Priset måste vara högre än 0 kr";
      }
    }
    if (!product.title) {
      badFields["title"] = "Tom titel";
    }
    if (!product.description) {
      badFields["description"] = "Måste ha beskrivning";
    }
    if (product.primaryQuantity && product.primaryQuantity <= 0) {
      badFields["primary"] = "Måste ange minst ett";
    }

    if (Object.keys(badFields).length) {
      firstStepWithErrors(badFields);
      setFieldErrors(badFields);
      return;
    }

    //if no errors, proceed
    setStep("project");
  };
  const onVerifyProject = () => {
    setStep("transportation");
  };
  const onVerifyTransportation = () => {
    setStep("preview");
  };
  const onVerifyPreview = () => {
    onSave(true);
  };
  const onProductDeleted = () => {
    onFinish();
  };
  const onFinish = () => {
    //reset
    setShowHandleDraft(false);
    setProduct(initialProduct);
    setStep("details");

    // onHide();
    onHide();
  };

  if (!data) {
    return null;
  }

  const updateDraftLoading = updatingProduct || uploadingMedia;

  return (
    <BottomSheet
      title={mode === "edit" ? "Redigera annons" : "Ny annons"}
      name={mode === "edit" ? "Redigera annons" : "Ny annons"}
      scrollable
      screenHeight
      open={visible}
      onDismiss={onDismissSheet}
      header={
        <ProgressHeader
          prog1={
            mode === "edit"
              ? progressDetails()
              : step === "payout"
                ? 25
                : progressDetails()
          }
          prog2={step !== "details" ? projectProgress : undefined}
          prog3={
            step !== "details" && step !== "project"
              ? transportationProgress
              : undefined
          }
          onClose={onDismissSheet}
          title={
            mode === "edit"
              ? "Redigera annons"
              : step === "preview"
                ? "Förhandsgranska annons"
                : "Ny annons"
          }
        />
      }
    >
      <View style={{ marginBottom: 32 }}>
        {step === "details" && (
          <Details
            product={product}
            update={onUpdateProduct}
            onNext={onVerifyDetails}
            nextIsDisabled={progressDetails() < 100}
          />
        )}
        {step === "project" && (
          <Project
            product={product}
            update={onUpdateProduct}
            onNext={onVerifyProject}
            nextIsDisabled={!projectProgress || projectProgress < 100}
            updateProgress={(progress) => setProjectProgress(progress)}
            onBack={() => setStep("details")}
          />
        )}
        {step === "transportation" && (
          <Transportation
            product={product}
            update={onUpdateProduct}
            onNext={onVerifyTransportation}
            nextIsDisabled={
              !transportationProgress || transportationProgress < 100
            }
            updateProgress={(progress) => setTransportationProgress(progress)}
            onBack={() => setStep("project")}
          />
        )}
        {step === "preview" && (
          <Preview
            product={product}
            update={onUpdateProduct}
            onNext={onVerifyPreview}
            onBack={() => setStep("details")}
            loading={updateDraftLoading}
            nextText={mode === "create" ? "Publicera" : "Spara"}
          />
        )}
        {step === "payout" && (
          <PayoutHandler onFinish={() => setStep("details")} />
        )}
      </View>
      <HandleDraftBottomSheet
        show={showHandleDraft}
        onDismiss={() => setShowHandleDraft(false)}
        dbDraft={data.product}
        product={product}
        onSaveDraft={() => onSave(false)}
        saveLoading={updateDraftLoading}
        onProductDeleted={onProductDeleted}
      />
    </BottomSheet>
  );
};
