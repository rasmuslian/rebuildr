import {
  ProductConditionEnum,
  QuantityUnitEnum,
  SellProductCreateDraftMutation,
  SellProductQueryQuery,
  SellProductUpdateMutation,
  SellProductUpdateMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Toggle } from "@components/controls/toggle";
import { BrandSection } from "@components/create-product/brand-section";
import { CategorySection } from "@components/create-product/category-section";
import { ConditionSection } from "@components/create-product/condition-section";
import { DescriptionSection } from "@components/create-product/description-section";
import { DocumentSection } from "@components/create-product/document-section";
import { ImageSection } from "@components/create-product/image-section";
import { MeasurementsSection } from "@components/create-product/measurements-section";
import { PriceSection } from "@components/create-product/price-section";
import { ProgressHeader } from "@components/create-product/progress-header";
import { QuantitiesSection } from "@components/create-product/quantities-section";
import { RootCategorySection } from "@components/create-product/root-category-section";
import { FileType } from "@components/create-product/types";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Title } from "@components/typography/text";
import { measurementKeys } from "@constants/measurements";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

const PRODUCT_DETAILS_FRAGMENT = gql`
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
  }
`;

const SELL_PRODUCT_CREATE_DRAFT = gql`
  mutation SellProductCreateDraft {
    createDraftProduct {
      ...ProductDetailsFragment
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

const SELL_PRODUCT_QUERY = gql`
  query SellProductQuery {
    getDraftedProduct {
      ...ProductDetailsFragment
    }
    me {
      id
      selectedPayoutMethod
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

const SELL_PRODUCT_UPDATE = gql`
  mutation SellProductUpdate($input: UpdateProductInput!) {
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

type ProductFields = {
  categoryIds: string[];
  title: string;
  description: string;
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
  brandId?: string;
  images: FileType[];
  documents: FileType[];
};

export default function SellProduct() {
  const [product, setProduct] = useState<ProductFields>();
  const [showDetails, setShowDetails] = useState(false);
  const { data, refetch } = useQuery<SellProductQueryQuery>(
    SELL_PRODUCT_QUERY,
    {
      notifyOnNetworkStatusChange: true, //necessary for the onCompleted to trigger during refetch
      onCompleted: async (data) => {
        //User must have a payout method to be able to sell
        if (!data.me.selectedPayoutMethod) {
          router.replace("/sell-product/payout");
          return;
        }
        const product = data.getDraftedProduct;
        if (!product) {
          //if drafted product does not exist, create a draft
          createDraft({
            onCompleted: () => refetch(),
          });
          return;
        }
        await productToState(product);
      },
      fetchPolicy: "network-only",
    },
  );
  const [updateProduct, { loading: updating }] = useMutation<
    SellProductUpdateMutation,
    SellProductUpdateMutationVariables
  >(SELL_PRODUCT_UPDATE);
  const [createDraft] = useMutation<SellProductCreateDraftMutation>(
    SELL_PRODUCT_CREATE_DRAFT,
  );

  const onUpdateProduct = async (
    _product: ProductFields,
    isFinal?: boolean,
  ) => {
    if (updating) {
      return;
    }
    const draft = data?.getDraftedProduct;
    if (!product || !draft) {
      return;
    }
    return updateProduct({
      variables: {
        input: {
          id: draft.id,
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
          categoryId: _product.categoryIds.at(-1) ?? null,
          brandId: _product.brandId ?? null,
          condition: _product.condition,
          addImages: _product.images
            //Only add images that are not already on Product
            .filter((image) => product.images.every((i) => i.id !== image.id))
            .map((image) => ({
              mimeType: image.mimeType,
              name: image.name,
            })),
          removeImages: product.images
            .filter((image) =>
              //Delete existing product's image if it does not exist in edited product
              _product.images.every(
                (selectedImage) => selectedImage.id !== image.id,
              ),
            )
            .map((image) => image.id as string),
          addDocuments: _product.documents
            //Only add documents that are not already on Product
            .filter((document) =>
              product.documents.every((i) => i.id !== document.id),
            )
            .map((document) => ({
              mimeType: document.mimeType,
              name: document.name,
            })),
          removeDocuments: product.documents
            .filter((document) =>
              //Delete existing product's document if it does not exist in edited product
              _product.documents.every(
                (selectedDocument) => selectedDocument.id !== document.id,
              ),
            )
            .map((document) => document.id as string),
        },
      },
      onCompleted: async (data) => {
        if (data.updateProduct.imagePutUrls) {
          await Promise.all(
            data.updateProduct.imagePutUrls.map(async (putUrl, index) => {
              const image = _product.images[index];
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
          );
        }
        if (data.updateProduct.documentPutUrls) {
          await Promise.all(
            data.updateProduct.documentPutUrls.map(async (putUrl, index) => {
              const doc = _product.documents[index];
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
          );
        }
        await productToState(data.updateProduct.product);
        if (isFinal) {
          router.navigate("/(app)/(tabs)/sell-product/project");
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
    const images = await Promise.all(
      _product.images.map(async (image, index) => {
        const uri = image.url;
        const imageExt = uri.split(".").pop();
        const blob = await fetch(uri).then((res) => res.blob());
        const imageData = new File([blob], `${Date.now()}.${imageExt}`);
        return {
          id: image.id,
          uri: image.url,
          index,
          mimeType: image.mimeType,
          file: imageData,
          size: blob.size,
          name: image.name,
        };
      }),
    );
    const documents = await Promise.all(
      _product.documents.map(async (document, index) => {
        const uri = document.url;
        const imageExt = uri.split(".").pop();
        const blob = await fetch(uri).then((res) => res.blob());
        const imageData = new File([blob], `${Date.now()}.${imageExt}`);
        return {
          id: document.id,
          uri: document.url,
          index,
          mimeType: document.mimeType,
          file: imageData,
          size: blob.size,
          name: document.name,
        };
      }),
    );

    const stateProduct = {
      categoryIds: _product.category
        ? [..._product.category.ancestorIds, _product.category.id]
        : [],
      title: _product.title ?? "",
      description: _product.description ?? "",
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
      images,
      documents,
    };

    //If any measurement is set, show details
    const measurementSet = measurementKeys.some(
      (measurementKey) => !!_product[measurementKey],
    );
    //show details if any measurements are set or any documents are chosen
    setShowDetails(measurementSet || !!_product?.documents.length);

    setProduct(stateProduct);
    return stateProduct;
  };

  const onNext = async () => {
    if (!product) {
      return;
    }
    onUpdateProduct(product, true);
  };

  const progress = () => {
    if (!product) {
      return 0;
    }

    const totalMandatories = 7;
    let obligatories = 0;
    if (product.images.length) {
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

  if (!product) {
    return <LoadingSpinner />;
  }

  const rootCategoryId = product.categoryIds[0];
  const categoryId = product.categoryIds[1];
  const showContinue = rootCategoryId && categoryId && product.brandId;
  const canSave = progress() >= 100;

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog1={progress()}
        />
      }
    >
      <RootCategorySection
        onSelect={(id) => onUpdateProduct({ ...product, categoryIds: [id] })}
        selectedId={product.categoryIds[0]}
        onChange={() => onUpdateProduct({ ...product, categoryIds: [] })}
      />
      {rootCategoryId && (
        <CategorySection
          parentId={rootCategoryId}
          onSelect={(id) =>
            onUpdateProduct({
              ...product,
              categoryIds: [...product.categoryIds, id],
            })
          }
          selectedId={product.categoryIds[1]}
          onChange={() =>
            onUpdateProduct({ ...product, categoryIds: [rootCategoryId] })
          }
        />
      )}
      {categoryId && (
        <>
          <ImageSection
            images={product.images}
            onUpdateImages={(images) => {
              onUpdateProduct({ ...product, images });
            }}
          />
          <PriceSection
            price={product.price ?? 0}
            isGiveaway={!!product.isGiveaway}
            onBlur={(price) => onUpdateProduct({ ...product, price })}
            onSelectGiveaway={() =>
              onUpdateProduct({
                ...product,
                isGiveaway: !product.isGiveaway,
                price: 0,
              })
            }
          />
          <DescriptionSection
            title={product.title}
            description={product.description}
            onBlurTitle={(title) => onUpdateProduct({ ...product, title })}
            onBlurDescription={(description) =>
              onUpdateProduct({ ...product, description })
            }
          />
          <QuantitiesSection
            categoryId={categoryId}
            primaryQuantity={product.primaryQuantity}
            primaryUnit={product.primaryUnit}
            onBlurPrimary={({ quantity, unit }) =>
              onUpdateProduct({
                ...product,
                primaryQuantity: quantity,
                primaryUnit: unit,
              })
            }
            secondaryQuantity={product.secondaryQuantity}
            secondaryUnit={product.secondaryUnit}
            onBlurSecondary={({ quantity, unit }) =>
              onUpdateProduct({
                ...product,
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
                  onUpdateProduct({ ...product, [measurementType]: value })
                }
              />
              <DocumentSection
                documents={product.documents}
                onUpdateFiles={(files) =>
                  onUpdateProduct({ ...product, documents: files })
                }
              />
            </>
          )}
          <ConditionSection
            condition={product.condition}
            onSelect={(condition) => onUpdateProduct({ ...product, condition })}
          />
          <BrandSection
            categoryId={categoryId}
            onSelect={(brandId) => onUpdateProduct({ ...product, brandId })}
            brandId={product.brandId}
          />
        </>
      )}
      {showContinue && (
        <Button
          label="Fortsätt"
          onPress={onNext}
          style={{ marginTop: 24 }}
          disabled={!canSave}
        />
      )}
    </ScreenLayout>
  );
}
