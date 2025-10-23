import { Divider } from "@components/dividers/divider";
import { AllImages } from "@components/preview-product/all-images";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { View } from "react-native";
import {
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

type Props = {
  product: ProductFields;
};

export const Preview = ({ product }: Props) => {
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
  const { data: brandData } = useQuery<
    ProductBottomSheetPreviewBrandQuery,
    ProductBottomSheetPreviewBrandQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PREVIEW_BRAND, {
    variables: {
      id: product.brandId!,
    },
    skip: !product.brandId,
  });

  if (!data || !categoryData || !brandData) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ gap: 24, marginTop: 24 }}>
      <ImageCarousel
        images={product.images?.map((i) => ({ url: i.uri })) ?? []}
        status={ProductStatusEnum.Draft}
      />
      <MainContent
        product={product}
        brand={brandData.brand}
        category={categoryData.category}
        parentCategory={categoryData.category.parent}
        documents={
          product.documents?.map((d) => ({
            url: d.uri,
            name: d.name,
          })) ?? []
        }
        myAddress={data.me.address}
        sellerIsMe
      />
      <Divider />
      <AllImages images={product.images?.map((i) => ({ url: i.uri })) ?? []} />
      {product.approximatePlace && product.pickupEnabled && (
        <PickupPosition
          address={product.approximatePlace.address}
          location={{
            lat: product.approximatePlace.lat,
            lng: product.approximatePlace.lng,
          }}
        />
      )}
    </View>
  );
};
