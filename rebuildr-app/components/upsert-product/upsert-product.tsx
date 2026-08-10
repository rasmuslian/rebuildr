import {
  ProductAvailabilityEnum,
  ProductConditionEnum,
  File as GqlFile,
  ProductStatusEnum,
  UpsertProductQuery,
  UpsertProductQueryVariables,
  UpsertProductUpdateProductMutation,
  UpsertProductUpdateProductMutationVariables,
  UpsertProductPublishInternalAdDraftsMutation,
  UpsertProductPublishInternalAdDraftsMutationVariables,
  MeasurementUnitEnum,
  ColorTypeEnum,
  AnalyzeProductImagesMutation,
  AnalyzeProductImagesMutationVariables,
  CreateSellerAccountMutation,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import {
  FileType,
  ProductFields,
  PublishedProductData,
} from "@components/upsert-product/types";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/utils/analytics";
import { ProgressHeader } from "@components/product/progress-header";
import { NEW_PROJECT_ID } from "./project-chips";
import { Transportation } from "./transportation";
import { Preview } from "./preview";
import { View } from "react-native";
import { HandleDraft } from "@components/sell-product/handle-draft";
import { SellerOnboardingHandler } from "@components/sell-product/seller-onboarding-handler";
import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { UPSERT_PRODUCT_PRODUCT_FRAGMENT } from "./queries";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import * as Sentry from "@sentry/react-native";
import { Body } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Details } from "./details";
import { GET_PROJECT } from "@/queries";
import { GTMTagEnum } from "@constants/google-tag-manager";
import { VerifyMeBottomSheet } from "@components/verify-me/verify-me-bottomsheet";

//The selection set must be a superset of every UpsertProductProductFragment
//field the AI can change (with identical sub-selections, notably category).
//Otherwise the cached UPSERT_PRODUCT query becomes a partial hit after the
//cache merge and Apollo silently refetches it over the network — the very
//round trip this mutation's response is meant to replace.
export const ANALYZE_PRODUCT_IMAGE = gql`
  mutation AnalyzeProductImages($input: AnalyzeProductImagesInput!) {
    analyzeProductImages(input: $input) {
      id
      title
      description
      additionalInfo
      priceSuggestionMin
      priceSuggestionMax
      co2SavingSeller
      category {
        id
        name
        hasChildren
        ancestorIds
      }
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      height
      heightUnit
      width
      widthUnit
      length
      lengthUnit
      thickness
      thicknessUnit
      diameter
      diameterUnit
      weight
      weightUnit
      color
      colorType
      condition
      brand {
        id
        type
      }
    }
  }
`;

export const UPSERT_PRODUCT = gql`
  query UpsertProduct($input: GetProductInput!) {
    product(input: $input) {
      ...UpsertProductProductFragment
    }
    me {
      id
      isVerified
      sellerAccount {
        canReceivePayment
      }
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

const UPSERT_PRODUCT_PUBLISH_INTERNAL_AD_DRAFTS = gql`
  mutation UpsertProductPublishInternalAdDrafts($productIds: [ID!]!) {
    publishInternalAdDrafts(productIds: $productIds) {
      id
      status
      internalValidationIssues
    }
  }
`;

const CREATE_SELLER_ACCOUNT = gql`
  mutation CreateSellerAccount {
    createSellerAccount {
      canReceivePayment
    }
  }
`;

export const initialProduct: ProductFields = {
  //initial
  categoryIds: undefined,
  title: undefined,
  description: undefined,
  additionalInfo: undefined,
  internalReferenceNumber: undefined,
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
  soldByQuantity: undefined,
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
  "availability",
];
const transportaionErrorFields = ["delivery"];

type Props = {
  productId?: string;
  mode: "create" | "edit";
  visible: boolean;
  inline?: boolean;
  compact?: boolean;
  loading?: boolean;
  internalMode?: boolean;
  onHide: () => void;
  onDelete?: () => void;
  onInlineDraftSave?: (save: Promise<boolean | undefined>) => void;
  onPublished: (product?: PublishedProductData) => void;
};

export const UpsertProduct = ({
  productId,
  mode,
  visible,
  inline = false,
  compact = false,
  loading,
  internalMode = false,
  onHide,
  onDelete,
  onInlineDraftSave,
  onPublished,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [product, setProduct] = useState<ProductFields>(initialProduct);
  //variable determining when we have fetched data processed it
  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState<
    "details" | "transportation" | "preview" | "onboarding"
  >("details");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showHandleDraft, setShowHandleDraft] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsType>();

  //progress
  const [transportationProgress, setTransportationProgress] = useState<
    number | undefined
  >(undefined);

  const [showVerifyMe, setShowVerifyMe] = useState(false);

  const {
    data,
    loading: productLoading,
    refetch,
  } = useQuery<UpsertProductQuery, UpsertProductQueryVariables>(
    UPSERT_PRODUCT,
    {
      variables: { input: { id: productId ?? "" } },
      skip: !productId,
    },
  );
  const [updateProduct, { loading: updatingProduct, error }] = useMutation<
    UpsertProductUpdateProductMutation,
    UpsertProductUpdateProductMutationVariables
  >(UPSERT_PRODUCT_UPDATE_PRODUCT, { refetchQueries: [GET_PROJECT] });
  const [
    publishInternalDrafts,
    { loading: publishingInternal, error: publishInternalError },
  ] = useMutation<
    UpsertProductPublishInternalAdDraftsMutation,
    UpsertProductPublishInternalAdDraftsMutationVariables
  >(UPSERT_PRODUCT_PUBLISH_INTERNAL_AD_DRAFTS);
  const [
    analyzeImages,
    { loading: imageAnalyzeLoading, error: imageAnalyzeError },
  ] = useMutation<
    AnalyzeProductImagesMutation,
    AnalyzeProductImagesMutationVariables
  >(ANALYZE_PRODUCT_IMAGE);
  const [createSellerAccount, { loading: createSellerAccountLoading }] =
    useMutation<CreateSellerAccountMutation>(CREATE_SELLER_ACCOUNT);

  useEffect(() => {
    if (visible) {
      setInitialized(false);
      //a new draft means a new ad — the auto-analysis must be allowed to run
      //again (the wizard component stays mounted between ads)
      analyzedImageCount.current = 0;
    }
  }, [productId]);

  useEffect(() => {
    const productToState = async (
      dbProduct: NonNullable<UpsertProductQuery["product"]>,
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
      const images = await convertDbFiles(dbProduct.images);
      const documents = await convertDbFiles(dbProduct.documents);

      const stateProduct: ProductFields = {
        //details
        categoryIds: dbProduct?.category
          ? [...dbProduct?.category.ancestorIds, dbProduct?.category.id]
          : [],
        title: dbProduct?.title || undefined,
        description: dbProduct?.description ?? undefined,
        additionalInfo: dbProduct?.additionalInfo ?? undefined,
        internalReferenceNumber:
          dbProduct?.internalReferenceNumber ?? undefined,
        price: internalMode ? 0 : dbProduct?.price || undefined,
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
        isGiveaway: internalMode ? true : dbProduct?.isGiveaway,
        soldByQuantity: dbProduct?.soldByQuantity ?? undefined,
        priceSuggestionMin: dbProduct?.priceSuggestionMin ?? undefined,
        priceSuggestionMax: dbProduct?.priceSuggestionMax ?? undefined,
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
        availability: dbProduct.availability ?? undefined,
        estimatedAvailableAt: dbProduct.estimatedAvailableAt ?? undefined,
        availabilityPrecision: dbProduct.availabilityPrecision ?? undefined,
        availableUntil: dbProduct.availableUntil ?? undefined,
      };
      setProduct(stateProduct);
      //Baseline the analyzed-image count ONCE, on the first load of this draft —
      //not on every data change. A resumed draft that already has content keeps
      //its images marked analyzed (merely opening it won't re-run AI); a blank
      //draft stays at 0 so the first image triggers analysis. Re-running this on
      //later data changes — e.g. the save step before analysis, when no title
      //exists yet — would wrongly reset it to 0 and double-trigger the analysis.
      if (!initialized) {
        analyzedImageCount.current =
          dbProduct.title || dbProduct.description ? images.length : 0;
      }
      setInitialized(true);
    };
    if (data?.product && !initialized) {
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

  const update = async (status?: ProductStatusEnum) => {
    if (!data || updateDraftLoading) {
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

    const { data: updateData, errors } = await updateProduct({
      variables: {
        input: {
          id: data.product.id,
          title: product.title,
          description: product.description,
          additionalInfo: product.additionalInfo,
          internalReferenceNumber: internalMode
            ? product.internalReferenceNumber
            : undefined,
          price: internalMode ? undefined : product.price,
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
          isGiveAway: internalMode ? undefined : product.isGiveaway,
          soldByQuantity: product.soldByQuantity,
          //only send null (= remove category) when the db product actually
          //has a category to remove — a fresh photo-first draft has none yet
          categoryId: product.categoryIds?.length
            ? product.categoryIds.at(-1)
            : data.product.category
              ? null
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
          projectId: product.project
            ? product.project.id === NEW_PROJECT_ID
              ? undefined
              : product.project.id
            : null,
          noProject: product.noProject,

          //transportation
          pickupEnabled: internalMode ? true : product.pickupEnabled,
          location: product.location
            ? { lat: product.location.lat, lng: product.location.lng }
            : undefined,
          shippingPriceIds: internalMode
            ? []
            : product.shippingPrices.map((sp) => sp.id),
          deliveryRadius: product.deliveryRadius,
          deliveryPrice: product.deliveryPrice,
          deliveryEnabled: internalMode ? false : product.deliveryEnabled,

          status,
          availability: product.availability,
          estimatedAvailableAt: product.estimatedAvailableAt || null,
          availabilityPrecision: product.availabilityPrecision,
          availableUntil: product.availableUntil || null,
        },
      },
    });

    if (errors) {
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
      return false;
    }
    if (updateData) {
      let mediaPromises: Promise<void>[] = [];
      if (updateData.updateProduct.imagePutUrls) {
        mediaPromises = [
          ...mediaPromises,
          ...updateData.updateProduct.imagePutUrls.map(
            async (putUrl, index) => {
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
            },
          ),
        ];
      }
      if (updateData.updateProduct.documentPutUrls) {
        mediaPromises = [
          ...mediaPromises,
          ...updateData.updateProduct.documentPutUrls.map(
            async (putUrl, index) => {
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
            },
          ),
        ];
      }
      if (mediaPromises.length) {
        try {
          setUploadingMedia(true);
          await Promise.all(mediaPromises);
          setProduct({
            ...product,
            images: product.images?.filter((image) => image.file),
            documents: product.documents?.filter((document) => document.file),
          });
        } catch (e) {
          Sentry.captureException(e);
        } finally {
          setUploadingMedia(false);
        }
      }
      return true;
    }

    return false;
  };

  const [analyzePending, setAnalyzePending] = useState(false);
  const onAnalyzeImages = async () => {
    if (!data || !productId) return;
    //the Apollo loading flag only turns on once the mutation fires — this
    //state also covers the image-saving update() below, so the UI shows the
    //analysis state for the whole run
    setAnalyzePending(true);
    try {
      //save first so that all images are available on the backend
      const saved = await update();
      if (!saved) return;

      await analyzeImages({ variables: { input: { productId } } });
    } finally {
      setAnalyzePending(false);
    }
  };

  //Photo-first: (re)run AI analysis whenever images are ADDED, so every new
  //photo informs the suggestions across all images. The first photo auto-fills
  //a fresh ad; each additional photo re-runs the analysis on the whole set.
  //analyzedImageCount tracks the image count we last kicked off analysis for.
  const analyzedImageCount = useRef(0);
  const imageCount = product.images?.length ?? 0;
  //debounce so a burst of added images coalesces into ONE analysis over the
  //whole set — fewer AI calls (= fewer transient failures) and it matches the
  //"re-run on all images" intent better than one call per image
  const reanalyzeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  //mirrors the effect's guards so the analysis state is visible from the very
  //first render after an image is added — without this the category pickers
  //flash until the effect has run and update() has saved
  const shouldAutoAnalyzeImages = mode === "create" || internalMode;
  const willAutoAnalyze =
    shouldAutoAnalyzeImages &&
    initialized &&
    imageCount > analyzedImageCount.current &&
    !imageAnalyzeLoading &&
    !analyzePending;
  useEffect(() => {
    if (!shouldAutoAnalyzeImages || !initialized) {
      return;
    }
    if (imageCount === 0) {
      //all images removed — let the next added image analyze again
      analyzedImageCount.current = 0;
      return;
    }
    //only (re)analyze when images were added, and never overlap a running
    //analysis — the loading/pending deps re-run this effect when a run
    //finishes, so any images added mid-run get picked up right after
    if (
      imageCount <= analyzedImageCount.current ||
      imageAnalyzeLoading ||
      analyzePending
    ) {
      return;
    }
    //wait until the user stops adding images, then analyze the full set once
    reanalyzeTimer.current = setTimeout(() => {
      analyzedImageCount.current = imageCount;
      //never let an analysis failure crash the wizard — the user can always
      //fill in the fields manually
      onAnalyzeImages().catch((e) => {
        Sentry.captureException(e);
      });
    }, 700);
    return () => clearTimeout(reanalyzeTimer.current);
  }, [
    imageCount,
    initialized,
    imageAnalyzeLoading,
    analyzePending,
    shouldAutoAnalyzeImages,
  ]);

  const onSave = async (published: boolean) => {
    const result = await update(
      published && !internalMode ? ProductStatusEnum.Published : undefined,
    );
    if (result) {
      if (published) {
        if (internalMode && data?.product.id) {
          const publishResult = await publishInternalDrafts({
            variables: { productIds: [data.product.id] },
          });
          if (publishResult.errors) {
            return;
          }
        }
        trackEvent(GTMTagEnum.PUBLISH_PRODUCT, { mode });
        const publishedData: PublishedProductData = {
          productId: data?.product.id,
          title: product.title,
          imageUrl: product.images?.[0]?.uri,
          condition: product.condition,
          primaryQuantity: product.primaryQuantity,
          primaryUnit: product.primaryUnit,
          price: product.price,
          isGiveaway: product.isGiveaway,
          soldByQuantity: product.soldByQuantity,
        };
        onFinish(publishedData);
      } else {
        onClose();
      }
    }
  };

  const progressDetails = () => {
    if (!product) {
      return 0;
    }

    const totalMandatories = internalMode ? 6 : 7;
    let obligatories = internalMode ? 1 : 0;
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
    //From the onboarding step, dismiss returns to the preview
    if (step === "onboarding") {
      setStep("preview");
      return;
    }
    //Check if we should prompt draft saving sheet
    if (!data) {
      onClose();
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
        if (product.project?.id === NEW_PROJECT_ID) return false;
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
        const keyDiffers =
          product[key as keyof typeof product] !==
          (dbProduct[key as keyof typeof dbProduct] ?? undefined);
        return keyDiffers;
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
      if (internalMode) {
        if (!onVerifyTransportation(product, true)) return;
        const save = update();
        if (inline) {
          onPublished();
          onInlineDraftSave?.(save);
          return;
        }
        save.then((saved) => {
          if (saved) {
            setStep("preview");
          }
        });
        return;
      }
      setStep("transportation");
    }
  };
  const onNextTransportation = () => {
    const result = onVerifyTransportation(product, true);
    update().then(() => {
      if (result) {
        setStep("preview");
      }
    });
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
    if (!internalMode && !_product.isGiveaway) {
      if (_product.price === undefined) {
        badFields["price"] = `Ange pris (0 kr = bortskänkes)`;
      } else if (_product.price < data.product.minimumPrice) {
        badFields["price"] =
          `Priset måste vara högre än ${data.product.minimumPrice} kr`;
      }
    }
    if (!_product.title) {
      badFields["title"] = "Saknar Annonsrubrik";
    }
    if (!_product.description) {
      badFields["description"] = "Saknar Beskrivning";
    }
    if (
      _product.primaryQuantity !== undefined &&
      _product.primaryQuantity <= 0
    ) {
      badFields["primary"] = "Mängd och enhet måste vara minst 1";
    }

    setFieldErrors(badFields);
    if (Object.keys(badFields).length) {
      firstStepWithErrors(badFields);
      return false;
    }

    //if no errors, proceed
    return true;
  };
  // enforceAvailability: only surface the "snart till salu" date errors on an
  // actual submit (Förhandsgranska), not on every live edit — otherwise the
  // red error flashes the instant you pick "Snart till salu", before you've
  // had a chance to choose a date.
  const onVerifyTransportation = (
    p?: ProductFields,
    enforceAvailability = false,
  ) => {
    if (!data) return;
    const _product = p ?? product;
    const badFields: FieldErrorsType = { ...fieldErrors };

    delete badFields["delivery"];
    delete badFields["availability"];
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
    if (
      enforceAvailability &&
      _product.availability === ProductAvailabilityEnum.Upcoming
    ) {
      if (!_product.estimatedAvailableAt) {
        badFields["availability"] = "Välj när varan blir tillgänglig";
      } else if (
        _product.availableUntil &&
        new Date(_product.availableUntil) <=
          new Date(_product.estimatedAvailableAt)
      ) {
        badFields["availability"] = "Slutdatum måste vara efter startdatum";
      }
    }
    setFieldErrors(badFields);
    if (Object.keys(badFields).length) {
      firstStepWithErrors(badFields);
      return false;
    }

    //if no errors, proceed
    return true;
  };
  const onVerifyPreview = async (freshData?: typeof data) => {
    const d = freshData ?? data;
    if (!d) return;

    if (internalMode) {
      onSave(true);
      return;
    }

    if (!d.me.isVerified) {
      setShowVerifyMe(true);
      return;
    }

    let sellerAccount = d.me.sellerAccount;
    //Create seller account if it does not exist
    if (!sellerAccount) {
      const response = await createSellerAccount();
      if (response.errors || !response.data) {
        return;
      }
      sellerAccount = response.data.createSellerAccount;
    }
    //Seller must verify personal details before they can receive payment —
    //send them to the onboarding step before publishing.
    if (!sellerAccount.canReceivePayment) {
      setStep("onboarding");
      return;
    }
    onSave(true);
  };
  const onProductDeleted = () => {
    onClose();
  };
  const reset = () => {
    setShowHandleDraft(false);
    setProduct(initialProduct);
    setInitialized(false);
    setStep("details");
    analyzedImageCount.current = 0;
  };
  const onClose = () => {
    reset();
    onHide();
  };
  const onFinish = (publishedData?: PublishedProductData) => {
    reset();
    onPublished(publishedData);
  };

  const showFooter = step === "preview";
  const updateDraftLoading =
    updatingProduct || uploadingMedia || publishingInternal;
  const isInitializing = loading || productLoading || !data || !initialized;

  const renderFooter = () => {
    if (showFooter && !isInitializing) {
      return (
        <View
          style={{
            paddingTop: 24,
            gap: 6,
          }}
        >
          {(error || publishInternalError) && (
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
              label="Publicera"
              onPress={() => onVerifyPreview()}
              style={{ flex: 1 }}
              loading={updateDraftLoading || createSellerAccountLoading}
            />
          </View>
        </View>
      );
    }
    return undefined;
  };

  const header = (
    <ProgressHeader
      prog1={progressDetails()}
      prog2={step !== "details" ? transportationProgress : undefined}
      onClose={onDismissSheet}
      title={
        mode === "edit"
          ? internalMode
            ? "Redigera intern annons"
            : "Redigera annons"
          : step === "preview"
            ? internalMode
              ? "Förhandsgranska intern annons"
              : "Förhandsgranska annons"
            : internalMode
              ? "Ny intern annons"
              : "Ny annons"
      }
    />
  );

  const viewChildren = () => {
    if (!data) {
      return null;
    }

    switch (step) {
      case "details":
        return (
          <Details
            product={product}
            update={onUpdateProduct}
            onNext={onNextDetails}
            badFields={fieldErrors}
            onAnalyzeImages={onAnalyzeImages}
            imageAnalyzeLoading={
              imageAnalyzeLoading || analyzePending || willAutoAnalyze
            }
            imageAnalyzeError={!!imageAnalyzeError}
            internalMode={internalMode}
            nextLabel={inline ? "Spara" : undefined}
            onDelete={inline ? onDelete : undefined}
            compact={compact}
          />
        );
      case "transportation":
        return (
          <Transportation
            product={product}
            update={onUpdateProduct}
            onNext={onNextTransportation}
            nextIsDisabled={
              !transportationProgress || transportationProgress < 100
            }
            updateProgress={(progress) => setTransportationProgress(progress)}
            onBack={() => setStep("details")}
            badFields={fieldErrors}
          />
        );
      case "preview":
        return (
          <Preview
            product={product}
            dbProductId={data.product.id}
            internalMode={internalMode}
          />
        );
      case "onboarding":
        return (
          <SellerOnboardingHandler
            onFinish={() => {
              setStep("preview");
              onVerifyPreview();
            }}
            onAbort={onFinish}
          />
        );
    }
    return null;
  };

  if (inline) {
    return isInitializing ? (
      <LoadingSpinner style={{ marginTop: 24 }} />
    ) : (
      <View>{viewChildren()}</View>
    );
  }

  if (isDesktop) {
    return (
      <>
        <SlideInSheet open={visible} bottomMargin={0} onClose={onDismissSheet}>
          <View>{header}</View>
          <View>
            {isInitializing ? (
              <LoadingSpinner style={{ marginTop: 24 }} />
            ) : (
              viewChildren()
            )}
          </View>
          {showFooter && !isInitializing && (
            <View
              style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                backgroundColor: "white",
                paddingBottom: 32,
              }}
            >
              {renderFooter()}
            </View>
          )}
        </SlideInSheet>
        {data && (
          <HandleDraft
            show={showHandleDraft}
            onDismiss={() => setShowHandleDraft(false)}
            dbDraft={data.product}
            product={product}
            onSaveDraft={() => onSave(false)}
            saveLoading={updateDraftLoading}
            onProductDeleted={onProductDeleted}
          />
        )}
        <VerifyMeBottomSheet
          show={showVerifyMe}
          onDismiss={() => setShowVerifyMe(false)}
          onResult={async () => {
            setShowVerifyMe(false);
            const result = await refetch();
            onVerifyPreview(result.data);
          }}
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
      footer={isInitializing ? undefined : renderFooter()}
      isStickyFooter
    >
      <View style={{ marginBottom: 32 }}>
        {isInitializing ? (
          <LoadingSpinner style={{ marginTop: 24 }} />
        ) : (
          viewChildren()
        )}
      </View>
      {data && (
        <HandleDraft
          show={showHandleDraft}
          onDismiss={() => setShowHandleDraft(false)}
          dbDraft={data.product}
          product={product}
          onSaveDraft={() => onSave(false)}
          saveLoading={updateDraftLoading}
          onProductDeleted={onProductDeleted}
        />
      )}
      <VerifyMeBottomSheet
        show={showVerifyMe}
        onDismiss={() => setShowVerifyMe(false)}
        onResult={async () => {
          setShowVerifyMe(false);
          const result = await refetch();
          onVerifyPreview(result.data);
        }}
      />
    </BottomSheet>
  );
};
