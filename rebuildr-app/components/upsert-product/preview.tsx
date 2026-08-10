import { Divider } from "@components/dividers/divider";
import { AllImages } from "@components/preview-product/all-images";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { View } from "react-native";
import {
  PreviewProductUpsertQuery,
  PreviewProductUpsertQueryVariables,
  ProductBottomSheetPreviewBrandQuery,
  ProductBottomSheetPreviewBrandQueryVariables,
  ProductBottomSheetPreviewCategoryQuery,
  ProductBottomSheetPreviewCategoryQueryVariables,
  ProductBottomSheetPreviewQuery,
  ProductStatusEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ProductFields } from "./types";
import { useState } from "react";
import { useScreenType } from "@hooks/useScreenType";
import { ImageGallery } from "@components/preview-product/image-gallery";
import { AllImagesPopupContent } from "@components/preview-product/all-images-popup-content";
import { Popup } from "@components/popup/popup";
import { CO2Savings } from "@components/preview-product/CO2-savings";

const PRODUCT_BOTTOM_SHEET_PREVIEW_CATEGORY = gql`
  query ProductBottomSheetPreviewCategory($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      parent {
        id
        name
      }
    }
  }
`;
const PRODUCT_BOTTOM_SHEET_PREVIEW_BRAND = gql`
  query ProductBottomSheetPreviewBrand($id: String!) {
    brand(id: $id) {
      id
      type
      name
    }
  }
`;

const PRODUCT_BOTTOM_SHEET_PREVIEW = gql`
  query ProductBottomSheetPreview {
    me {
      id
      address
    }
  }
`;

const PREVIEW_PRODUCT_UPSERT = gql`
  query PreviewProductUpsert($input: GetProductInput!) {
    product(input: $input) {
      id
      co2SavingSeller
    }
  }
`;

type Props = {
  product: ProductFields;
  dbProductId: string;
  internalMode?: boolean;
};

export const Preview = ({ product, dbProductId, internalMode }: Props) => {
  const { isDesktop } = useScreenType();
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [showAllImagesPopup, setShowAllImagesPopup] = useState(false);

  const { data } = useQuery<ProductBottomSheetPreviewQuery>(
    PRODUCT_BOTTOM_SHEET_PREVIEW,
    {
      variables: {
        input: {
          id: product.categoryIds?.[1]!,
        },
      },
      skip: !product.categoryIds?.[1],
    },
  );

  const { data: categoryData } = useQuery<
    ProductBottomSheetPreviewCategoryQuery,
    ProductBottomSheetPreviewCategoryQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PREVIEW_CATEGORY, {
    variables: {
      input: {
        id: product.categoryIds?.[1]!,
      },
    },
    skip: !product.categoryIds?.[1],
  });

  const { data: productData } = useQuery<
    PreviewProductUpsertQuery,
    PreviewProductUpsertQueryVariables
  >(PREVIEW_PRODUCT_UPSERT, {
    variables: {
      input: { id: dbProductId },
    },
  });
  const { data: brandData } = useQuery<
    ProductBottomSheetPreviewBrandQuery,
    ProductBottomSheetPreviewBrandQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PREVIEW_BRAND, {
    variables: {
      id: product.brandId!,
    },
    skip: !product.brandId,
  });

  const handleShowAllImagesPopup = () => {
    if (!product.images) return;
    setShowAllImagesPopup(true);
  };

  if (!data || !categoryData || !brandData) {
    return <LoadingSpinner />;
  }

  return (
    <View
      style={{ gap: 24, marginTop: 24 }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setWidth(w - 16);
      }}
    >
      {isDesktop ? (
        <ImageGallery
          images={product.images?.map((i) => ({ url: i.uri })) ?? []}
          status={ProductStatusEnum.Draft}
        />
      ) : (
        <ImageCarousel
          images={product.images?.map((i) => ({ url: i.uri })) ?? []}
          status={ProductStatusEnum.Draft}
        />
      )}
      <MainContent
        product={product}
        brand={brandData.brand}
        category={categoryData.category}
        parentCategory={categoryData.category.parent}
        documents={
          product.documents?.map((d) => ({
            url: d.uri,
            name: d.name,
            mimeType: d.mimeType,
          })) ?? []
        }
        myAddress={data.me.address}
        sellerIsMe
        hidePrice={internalMode}
      />
      <Divider />
      <AllImages
        images={product.images?.map((i) => ({ url: i.uri })) ?? []}
        imagesPerRow={isDesktop ? 3 : undefined}
        parentWidth={width}
        onAllImagesPress={handleShowAllImagesPopup}
      />
      <CO2Savings co2SavingSeller={productData?.product.co2SavingSeller} />
      {product.approximatePlace && product.pickupEnabled && (
        <PickupPosition
          address={product.approximatePlace.address}
          location={{
            lat: product.approximatePlace.lat,
            lng: product.approximatePlace.lng,
          }}
        />
      )}
      {isDesktop && product.images && product.images.length > 0 && (
        <Popup
          open={showAllImagesPopup}
          onClose={() => setShowAllImagesPopup(false)}
          type="full"
        >
          <AllImagesPopupContent
            images={product.images?.map((i) => ({ url: i.uri }))}
          />
        </Popup>
      )}
    </View>
  );
};
