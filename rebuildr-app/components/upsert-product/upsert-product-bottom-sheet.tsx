import {
  ProductConditionEnum,
  File as GqlFile,
  ProductStatusEnum,
  UpsertProductBottomSheetQuery,
  UpsertProductBottomSheetQueryVariables,
  UpsertProductUpdateProductMutation,
  UpsertProductUpdateProductMutationVariables,
  MeasurementUnitEnum,
  ColorTypeEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { FileType, ProductFields } from "@components/upsert-product/types";
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
import { Button } from "@components/buttons/button";
import * as Sentry from "@sentry/react-native";
import { Body } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";

export const UPSERT_PRODUCT_BOTTOM_SHEET = gql`
  query UpsertProductBottomSheet($input: GetProductInput!) {
    product(input: $input) {
      ...UpsertProductProductFragment
    }
    me {
      id
      sellerAccountIsEnabled
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

export const initialProduct: ProductFields = {
  //initial
  categoryIds: undefined,
  title: undefined,
  description: undefined,
  additionalInfo: undefined,
  price: undefined,
  primaryQuantity: undefined,
  primaryUnit: undefined,
  secondaryQuantity: undefined,
  secondaryUnit: undefined,
  thickness: undefined,
  thicknessUnit: MeasurementUnitEnum.Mm,
  height: undefined,
  heightUnit: MeasurementUnitEnum.Mm,
  width: undefined,
  widthUnit: MeasurementUnitEnum.Mm,
  length: undefined,
  lengthUnit: MeasurementUnitEnum.Mm,
  diameter: undefined,
  diameterUnit: MeasurementUnitEnum.Mm,
  weight: undefined,
  weightUnit: MeasurementUnitEnum.Kg,
  isGiveaway: undefined,
  condition: ProductConditionEnum.Good,
  brandId: undefined,
  images: undefined,
  documents: undefined,
  minimumPrice: undefined,
  color: undefined,
  colorType: ColorTypeEnum.Ncs,

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

type FieldErrorsType = { [key in string]: string };
const detailsErrorFields = [
  "images",
  "price",
  "title",
  "description",
  "primary",
];
const transportaionErrorFields = ["delivery"];

type Props = {
  productId: string;
  mode: "create" | "edit";
  visible: boolean;
  onHide: () => void;
  onPublished: () => void;
};

export const UpsertProductBottomSheet = ({
  productId,
  mode,
  visible,
  onHide,
  onPublished,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [product, setProduct] = useState<ProductFields>(initialProduct);
  //variable determining when we have fetched data processed it
  const [initialized, setInitialized] = useState(false);
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
  const [updateProduct, { loading: updatingProduct, error }] = useMutation<
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
        title: dbProduct?.title || undefined,
        description: dbProduct?.description ?? undefined,
        additionalInfo: dbProduct?.additionalInfo ?? undefined,
        price: dbProduct?.price || undefined,
        primaryQuantity: dbProduct?.primaryQuantity ?? undefined,
        primaryUnit: dbProduct?.primaryUnit ?? undefined,
        secondaryQuantity: dbProduct?.secondaryQuantity ?? undefined,
        secondaryUnit: dbProduct?.secondaryUnit ?? undefined,
        thickness: dbProduct?.thickness ?? undefined,
        thicknessUnit: dbProduct?.thicknessUnit ?? undefined,
        height: dbProduct?.height ?? undefined,
        heightUnit: dbProduct?.heightUnit ?? undefined,
        width: dbProduct?.width ?? undefined,
        widthUnit: dbProduct?.widthUnit ?? undefined,
        length: dbProduct?.length ?? undefined,
        lengthUnit: dbProduct?.lengthUnit ?? undefined,
        diameter: dbProduct?.diameter ?? undefined,
        diameterUnit: dbProduct?.diameterUnit ?? undefined,
        weight: dbProduct?.weight ?? undefined,
        weightUnit: dbProduct?.weightUnit ?? undefined,
        isGiveaway: dbProduct?.isGiveaway,
        condition: dbProduct?.condition,
        brandId: dbProduct?.brand ? dbProduct?.brand.id : undefined,
        images: images.length ? images : undefined,
        documents: documents.length ? documents : undefined,
        color: dbProduct?.color ?? undefined,
        colorType: dbProduct?.colorType ?? undefined,

        //project
        project: dbProduct.project
          ? {
              ...dbProduct.project,
            }
          : undefined,
        noProject: dbProduct.noProject ?? undefined,

        //transportation
        address: dbProduct.address ?? undefined,
        location: dbProduct.location
          ? { lat: dbProduct.location.lat, lng: dbProduct.location.lng }
          : undefined,
        approximatePlace: dbProduct.approximatePlace ?? undefined,
        pickupEnabled: dbProduct.pickupEnabled,
        deliveryEnabled: dbProduct.deliveryEnabled,
        deliveryPrice: dbProduct.deliveryPrice ?? undefined,
        deliveryRadius: dbProduct.deliveryRadius ?? undefined,
        shippingPrices: dbProduct.shippingPrices ?? [],

        status: dbProduct.status ?? product.status,
      };
      setProduct(stateProduct);
      setInitialized(true);
    };
    if (data) {
      //check if user has payout account
      if (!data.me.sellerAccountIsEnabled && mode === "create") {
        setStep("payout");
      }
      //convert to productState
      productToState(data.product);
    }
  }, [visible, data]);

  //Find the first step that contains errors
  const firstStepWithErrors = (errorFields: FieldErrorsType) => {
    const errorInDetails = Object.keys(errorFields).some((key) =>
      detailsErrorFields.some((field) => field === key),
    );
    if (errorInDetails) {
      setStep("details");
      return;
    }
    const errorInTransportation = Object.keys(errorFields).some((key) =>
      transportaionErrorFields.some((field) => field === key),
    );
    if (errorInTransportation) {
      setStep("transportation");
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
          additionalInfo: product.additionalInfo,
          price: product.price,
          primaryQuantity: product.primaryQuantity,
          primaryUnit: product.primaryUnit,
          secondaryQuantity: product.secondaryQuantity ?? null,
          secondaryUnit: product.secondaryUnit ?? null,
          thickness: product.thickness,
          thicknessUnit: product.thicknessUnit,
          height: product.height,
          heightUnit: product.heightUnit,
          width: product.width,
          widthUnit: product.widthUnit,
          length: product.length,
          lengthUnit: product.lengthUnit,
          diameter: product.diameter,
          diameterUnit: product.diameterUnit,
          weight: product.weight,
          weightUnit: product.weightUnit,
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
          color: product.color,
          colorType: product.colorType,

          //project
          projectId: product.project?.id,
          noProject: product.noProject,

          //transportation
          pickupEnabled: product.pickupEnabled,
          location: product.location
            ? { lat: product.location.lat, lng: product.location.lng }
            : undefined,
          shippingPriceIds: product.shippingPrices.map((sp) => sp.id),
          deliveryRadius: product.deliveryRadius,
          deliveryPrice: product.deliveryPrice,
          deliveryEnabled: product.deliveryEnabled,

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
          try {
            setUploadingMedia(true);
            await Promise.all(mediaPromises);
          } catch (e) {
            Sentry.captureException(e);
          } finally {
            setUploadingMedia(false);
          }
        }
        if (published) {
          onFinish();
        } else {
          onClose();
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
        setShowHandleDraft(false);
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
      onClose();
      return;
    }
    if (step === "payout") {
      onClose();
      return;
    }
    //Check if we should prompt draft saving sheet
    if (!data) {
      return;
    }
    const dbProduct = data.product;
    const saveDraft = Object.keys(product).some((key) => {
      if (key === "categoryIds") {
        return false;
      }
      if (key === "title") {
        return product.title === undefined
          ? false
          : product.title !== dbProduct.title;
      }
      if (key === "price") {
        return product.price === undefined
          ? false
          : product.price !== dbProduct.price;
      }
      if (key === "images") {
        return (product.images ?? []).length !== dbProduct.images.length
          ? true
          : !dbProduct.images.every(
              (i, idx) => i.id === product.images?.[idx].id,
            );
      }
      if (key === "documents") {
        return (product.documents ?? []).length !== dbProduct.documents.length
          ? true
          : !dbProduct.documents.every(
              (i, idx) => i.id === product.documents?.[idx].id,
            );
      }
      if (key === "location") {
        if (!!product.location && !!dbProduct.location) {
          return (
            product.location.lat !== dbProduct.location.lat ||
            product.location.lng !== dbProduct.location.lng
          );
        }
        //One has location while the other doesn't
        return !!product.location || !!dbProduct.location;
      }
      if (key === "project") {
        if (!!product.project && !!dbProduct.project) {
          return product.project.id !== dbProduct.project.id;
        }
        //One has project while the other doesn't
        return !!product.project || !!dbProduct.project;
      }
      if (key === "shippingPrices") {
        return product.shippingPrices.length !==
          (dbProduct.shippingPrices ?? []).length
          ? true
          : !product.shippingPrices.every(
              (sp, idx) => sp.id === dbProduct.shippingPrices?.[idx].id,
            );
      }
      if (key in product && key in dbProduct) {
        const keyEqual =
          product[key as keyof typeof product] !==
          (dbProduct[key as keyof typeof dbProduct] ?? undefined);
        return keyEqual;
      }
      return false;
    });

    if (!saveDraft) {
      onFinish();
      return;
    }
    setShowHandleDraft(true);
  };
  const onUpdateProduct = (partialProduct: Partial<ProductFields>) => {
    const newProduct = { ...product, ...partialProduct };
    onVerifyDetails(newProduct);
    onVerifyTransportation(newProduct);
    setProduct(newProduct);
  };
  const onNextDetails = () => {
    const result = onVerifyDetails(product);
    if (result) {
      setStep("project");
    }
  };
  const onNextTransportation = () => {
    const result = onVerifyTransportation(product);
    if (result) {
      setStep("preview");
    }
  };
  const onVerifyDetails = (p?: ProductFields) => {
    if (!data) return;
    const _product = p ?? product;
    const badFields: FieldErrorsType = { ...fieldErrors };

    // reset details fields
    delete badFields["images"];
    delete badFields["price"];
    delete badFields["title"];
    delete badFields["description"];
    delete badFields["primary"];
    if (_product.images && !_product.images.length) {
      badFields["images"] = "Måste bifoga minst en bild";
    }
    if (_product.price !== undefined && !_product.isGiveaway) {
      if (_product.price < data.product.minimumPrice) {
        badFields["price"] =
          `Priset måste vara högre än ${data.product.minimumPrice} kr`;
      }
    }
    if (_product.title === "") {
      badFields["title"] = "Måste har rubrik";
    }
    if (_product.description === "") {
      badFields["description"] = "Måste ha beskrivning";
    }
    if (_product.primaryQuantity && _product.primaryQuantity <= 0) {
      badFields["primary"] = "Måste ange minst ett";
    }

    setFieldErrors(badFields);
    if (Object.keys(badFields).length) {
      firstStepWithErrors(badFields);
      return false;
    }

    //if no errors, proceed
    return true;
  };
  const onVerifyProject = () => {
    setStep("transportation");
  };
  const onVerifyTransportation = (p?: ProductFields) => {
    if (!data) return;
    const _product = p ?? product;
    const badFields: FieldErrorsType = { ...fieldErrors };

    delete badFields["delivery"];
    if (
      _product.isGiveaway &&
      _product.deliveryEnabled &&
      _product.deliveryPrice &&
      _product.deliveryPrice < data.product.minimumPrice &&
      _product.deliveryPrice > 0
    ) {
      badFields["delivery"] =
        `Vid bortskänkes måste priset för hemleverans vara minst ${data.product.minimumPrice}kr eller gratis`;
    }
    setFieldErrors(badFields);
    if (Object.keys(badFields).length) {
      firstStepWithErrors(badFields);
      return false;
    }

    //if no errors, proceed
    return true;
  };
  const onVerifyPreview = () => {
    onSave(true);
  };
  const onProductDeleted = () => {
    onClose();
  };
  const reset = () => {
    setShowHandleDraft(false);
    setProduct(initialProduct);
    setStep("details");
  };
  const onClose = () => {
    reset();
    onHide();
  };
  const onFinish = () => {
    reset();
    onPublished();
  };

  const showFooter = step === "preview";

  const renderFooter = () => {
    if (showFooter) {
      return (
        <View
          style={{
            paddingTop: 24,
            gap: 6,
          }}
        >
          {error && (
            <Body size="small" color="error">
              Något gick fel, vänligen gå tillbaka och se över alla fält
            </Body>
          )}
          <View
            style={{
              gap: 8,
              flexDirection: "row",
            }}
          >
            <Button
              label="Redigera"
              type="tonal"
              onPress={() => setStep("details")}
              style={{ flex: 1 }}
            />
            <Button
              label={mode === "create" ? "Publicera" : "Publicera"}
              onPress={onVerifyPreview}
              style={{ flex: 1 }}
              loading={updateDraftLoading}
            />
          </View>
        </View>
      );
    }
    return undefined;
  };

  if (!data || !initialized) {
    return null;
  }

  const updateDraftLoading = updatingProduct || uploadingMedia;

  const header = (
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
  );

  const viewChildren = [
    step === "details" && (
      <Details
        product={product}
        update={onUpdateProduct}
        onNext={onNextDetails}
        nextIsDisabled={progressDetails() < 100}
        badFields={fieldErrors}
      />
    ),
    step === "project" && (
      <Project
        product={product}
        update={onUpdateProduct}
        onNext={onVerifyProject}
        nextIsDisabled={!projectProgress || projectProgress < 100}
        updateProgress={(progress) => setProjectProgress(progress)}
        onBack={() => setStep("details")}
      />
    ),
    step === "transportation" && (
      <Transportation
        product={product}
        update={onUpdateProduct}
        onNext={onNextTransportation}
        nextIsDisabled={!transportationProgress || transportationProgress < 100}
        updateProgress={(progress) => setTransportationProgress(progress)}
        onBack={() => setStep("project")}
        badFields={fieldErrors}
      />
    ),
    step === "preview" && <Preview product={product} />,
    step === "payout" && (
      <PayoutHandler onFinish={() => setStep("details")} onAbort={onFinish} />
    ),
  ];

  if (isDesktop) {
    return (
      <>
        <SlideInSheet open={visible} bottomMargin={0} onClose={onDismissSheet}>
          <View>{header}</View>
          <View>{viewChildren}</View>
          {showFooter && (
            <View style={{ marginBottom: 24 }}>{renderFooter()}</View>
          )}
        </SlideInSheet>
        <HandleDraftBottomSheet
          show={showHandleDraft}
          onDismiss={() => setShowHandleDraft(false)}
          dbDraft={data.product}
          product={product}
          onSaveDraft={() => onSave(false)}
          saveLoading={updateDraftLoading}
          onProductDeleted={onProductDeleted}
        />
      </>
    );
  }

  return (
    <BottomSheet
      title={mode === "edit" ? "Redigera annons" : "Ny annons"}
      name={mode === "edit" ? "Redigera annons" : "Ny annons"}
      scrollable
      screenHeight
      open={visible}
      onDismiss={onDismissSheet}
      header={header}
      footer={renderFooter()}
      isStickyFooter
    >
      <View style={{ marginBottom: 32 }}>{viewChildren}</View>
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
