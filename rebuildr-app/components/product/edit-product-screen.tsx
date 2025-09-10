import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { gql, useMutation } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { FileType, ProductFields } from "@components/product/types";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { ProgressHeader } from "./progress-header";
import { RootCategorySection } from "./root-category-section";
import { CategorySection } from "./category-section";
import { ImageSection } from "./image-section";
import { PriceSection } from "./price-section";
import { DescriptionSection } from "./description-section";
import { QuantitiesSection } from "./quantities-section";
import { View } from "react-native";
import { Body, Title } from "@components/typography/text";
import { MeasurementsSection } from "./measurements-section";
import { Toggle } from "@components/controls/toggle";
import { DocumentSection } from "./document-section";
import { ConditionSection } from "./condition-section";
import { BrandSection } from "./brand-section";
import { Button } from "@components/buttons/button";
import { measurementKeys } from "@constants/measurements";
import {
  ProductEditProductUpdateMutation,
  ProductEditProductUpdateMutationVariables,
  SellProductQueryQuery,
  File as GqlFile,
} from "@/gql/graphql";

export const PRODUCT_DETAILS_FRAGMENT = gql`
  fragment ProductDetailsFragment on Product {
    id
    title
    description
    price
    isGiveaway
    condition
    primaryQuantity
    primaryUnit
    secondaryQuantity
    secondaryUnit
    height
    width
    length
    thickness
    diameter
    weight
    images {
      id
      mimeType
      url
      name
    }
    documents {
      id
      mimeType
      url
      name
    }
    category {
      id
      name
      hasChildren
      ancestorIds
    }
    brand {
      id
      type
    }
    minimumPrice
  }
`;

const PRODUCT_EDIT_PRODUCT_UPDATE = gql`
  mutation ProductEditProductUpdate($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        ...ProductDetailsFragment
      }
      imagePutUrls
      documentPutUrls
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

type Props = {
  product: Exclude<
    SellProductQueryQuery["getDraftedProduct"],
    undefined | null
  >;
  title: string;
  nextUrl: Href;
  onDismiss: () => void;
};

export const EditProductScreen = ({
  product: dbProduct,
  title,
  nextUrl,
  onDismiss,
}: Props) => {
  const [product, setProduct] = useState<ProductFields>();
  const [showDetails, setShowDetails] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [updateProduct, { loading: updatingProduct, error }] = useMutation<
    ProductEditProductUpdateMutation,
    ProductEditProductUpdateMutationVariables
  >(PRODUCT_EDIT_PRODUCT_UPDATE, { onError: () => {} });

  const onUpdateProduct = async (
    _product: Partial<ProductFields>,
    isFinal?: boolean,
  ) => {
    if (loading) {
      return;
    }
    if (!product) {
      return;
    }

    const addFiles = (newFiles?: FileType[], currentFiles?: FileType[]) => {
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
    return updateProduct({
      variables: {
        input: {
          id: dbProduct.id,
          title: _product.title,
          description: _product.description,
          price: _product.price,
          primaryQuantity: _product.primaryQuantity,
          primaryUnit: _product.primaryUnit,
          secondaryQuantity: _product.secondaryQuantity ?? null,
          secondaryUnit: _product.secondaryUnit ?? null,
          thickness: _product.thickness,
          height: _product.height,
          width: _product.width,
          length: _product.length,
          diameter: _product.diameter,
          weight: _product.weight,
          isGiveAway: _product.isGiveaway,
          categoryId: _product.categoryIds
            ? (_product.categoryIds.at(-1) ?? null)
            : undefined,
          brandId: _product.brandId,
          condition: _product.condition,
          addImages: addFiles(_product.images, product.images),
          removeImages: removeFiles(_product.images, dbProduct.images),
          addDocuments: addFiles(_product.documents, product.documents),
          removeDocuments: removeFiles(_product.documents, dbProduct.documents),
        },
      },
      onCompleted: async (data) => {
        let mediaPromises: Promise<void>[] = [];
        if (data.updateProduct.imagePutUrls) {
          mediaPromises = [
            ...mediaPromises,
            ...data.updateProduct.imagePutUrls.map(async (putUrl, index) => {
              const image = _product.images?.[index];
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
              const doc = _product.documents?.[index];
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
        await productToState(data.updateProduct.product);
        if (isFinal) {
          router.navigate(nextUrl);
        }
      },
    });
  };

  const productToState = async (
    _product: Exclude<
      SellProductQueryQuery["getDraftedProduct"],
      undefined | null
    >,
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
    const dbImages = await convertDbFiles(_product.images);
    const images = dbImages.reduce(
      (images, image) => {
        if (images.some((i) => i.id === image.id)) {
          return images;
        }
        return [...images, image];
      },
      [...(product?.images ?? [])],
    );

    const documents = await convertDbFiles(_product.documents);

    const stateProduct = {
      categoryIds: _product.category
        ? [..._product.category.ancestorIds, _product.category.id]
        : [],
      title: _product.title ?? undefined,
      description: _product.description ?? undefined,
      price: _product.price,
      primaryQuantity: _product.primaryQuantity ?? undefined,
      primaryUnit: _product.primaryUnit ?? undefined,
      secondaryQuantity: _product.secondaryQuantity ?? undefined,
      secondaryUnit: _product.secondaryUnit ?? undefined,
      thickness: _product.thickness ?? undefined,
      height: _product.height ?? undefined,
      width: _product.width ?? undefined,
      length: _product.length ?? undefined,
      diameter: _product.diameter ?? undefined,
      weight: _product.weight ?? undefined,
      isGiveaway: _product.isGiveaway,
      condition: _product.condition,
      brandId: _product.brand ? _product.brand.id : undefined,
      images: images.length ? images : undefined,
      documents: documents.length ? documents : undefined,
    };

    setProduct(stateProduct);
    return stateProduct;
  };

  const onNext = async () => {
    if (!product) {
      return;
    }
    //update product but fill in every null value with default values to trigger
    //eventual error
    onUpdateProduct(
      {
        ...product,
        title: product.title ?? "",
        description: product.description ?? "",
        price: product.price ?? 0,
        primaryQuantity: product.primaryQuantity ?? 0,
      },
      true,
    );
  };

  const progress = () => {
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

  //Distribute any error messages on correct fields
  const apolloErrors = error ? apolloBadFieldsError(error) : [];
  const badFields: { [key in string]?: string } =
    apolloErrors?.reduce(
      (acc: { [key in string]: string }, curr) => ({
        ...acc,
        [curr.name]: curr.message,
      }),
      {},
    ) ?? {};

  useEffect(() => {
    productToState(dbProduct);
    //If any measurement is set, show details
    const measurementSet = measurementKeys.some(
      (measurementKey) => !!dbProduct[measurementKey],
    );
    //show details if any measurements are set or any documents are chosen
    setShowDetails(measurementSet || !!dbProduct.documents.length);
  }, [dbProduct]);

  if (!product) {
    return <LoadingSpinner />;
  }

  const rootCategoryId = product.categoryIds?.[0];
  const categoryId = product.categoryIds?.[1];
  const showContinue = rootCategoryId && categoryId && product.brandId;
  const loading = updatingProduct || uploadingMedia;
  const canSave = (progress() >= 100 && !error) || loading;

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader onClose={onDismiss} title={title} prog1={progress()} />
      }
    >
      <RootCategorySection
        onSelect={(id) => onUpdateProduct({ categoryIds: [id] })}
        selectedId={product.categoryIds?.[0]}
        onChange={() => onUpdateProduct({ categoryIds: [] })}
      />
      {rootCategoryId && (
        <CategorySection
          parentId={rootCategoryId}
          onSelect={(id) =>
            onUpdateProduct({
              categoryIds: [...(product.categoryIds ?? []), id],
            })
          }
          selectedId={product.categoryIds?.[1]}
          onChange={() =>
            onUpdateProduct({ ...product, categoryIds: [rootCategoryId] })
          }
        />
      )}
      {categoryId && (
        <>
          <ImageSection
            images={product.images ?? []}
            imageError={badFields["images"]}
            onUpdateImages={(images) => {
              setProduct({ ...product, images });
            }}
          />
          <PriceSection
            price={product.price ?? 0}
            minimumPrice={dbProduct.minimumPrice ?? 0}
            priceError={badFields["price"]}
            isGiveaway={!!product.isGiveaway}
            onUpdate={(isGiveaway, price) =>
              onUpdateProduct({ isGiveaway, price })
            }
          />
          <DescriptionSection
            title={product.title ?? ""}
            titleError={badFields["title"]}
            description={product.description ?? ""}
            descriptionError={badFields["description"]}
            onBlurTitle={(title) => onUpdateProduct({ title })}
            onBlurDescription={(description) =>
              onUpdateProduct({ description })
            }
          />
          <QuantitiesSection
            categoryId={categoryId}
            primaryQuantity={product.primaryQuantity}
            primaryUnit={product.primaryUnit}
            primaryError={badFields["primary"]}
            onBlurPrimary={({ quantity, unit }) =>
              onUpdateProduct({
                primaryQuantity: quantity,
                primaryUnit: unit,
              })
            }
            secondaryQuantity={product.secondaryQuantity}
            secondaryUnit={product.secondaryUnit}
            onBlurSecondary={({ quantity, unit }) =>
              onUpdateProduct({
                secondaryQuantity: quantity,
                secondaryUnit: unit,
              })
            }
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Title size="medium">Lägg till fler produktdetaljer</Title>
              <Body size="medium">
                Lägg till specifik produktinfo gällande mått, vikt eller
                dokumentation.
              </Body>
            </View>
            <Toggle
              value={showDetails}
              onPress={() => setShowDetails(!showDetails)}
            />
          </View>
          {showDetails && (
            <>
              <MeasurementsSection
                value={{
                  thickness: product.thickness,
                  height: product.height,
                  width: product.width,
                  length: product.length,
                  diameter: product.diameter,
                  weight: product.weight,
                }}
                onChange={(measurementType, value) =>
                  onUpdateProduct({ [measurementType]: value })
                }
              />
              <DocumentSection
                documents={product.documents ?? []}
                onUpdateFiles={(files) => onUpdateProduct({ documents: files })}
              />
            </>
          )}
          <ConditionSection
            condition={product.condition}
            onSelect={(condition) => onUpdateProduct({ condition })}
          />
          <BrandSection
            categoryId={categoryId}
            onSelect={(brandId) => onUpdateProduct({ brandId })}
            brandId={product.brandId}
            isLoading={updatingProduct}
          />
        </>
      )}
      {showContinue && (
        <View style={{ gap: 6 }}>
          <Button
            label="Fortsätt"
            onPress={onNext}
            style={{ marginTop: 24 }}
            disabled={!canSave}
            loading={loading}
          />
          {error && (
            <Body color="error" size="small">
              Ett fel har påträffats i ett eller flera fält
            </Body>
          )}
        </View>
      )}
    </ScreenLayout>
  );
};
