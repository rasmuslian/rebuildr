import {
  PreviewDraftedProductQuery,
  ProductStatusEnum,
  PublishProductMutation,
  PublishProductMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { ProgressHeader } from "@components/product/progress-header";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router } from "expo-router";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { AllImages } from "@components/preview-product/all-images";
import { PickupPosition } from "@components/preview-product/pickup-position";

const PREVIEW_DRAFTED_PRODUCT = gql`
  query PreviewDraftedProduct {
    getDraftedProduct {
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
        parent {
          id
          name
        }
      }
      brand {
        id
        name
        type
      }
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
      }
      pickupEnabled
      deliveryRadius
      deliveryPrice
      deliveryEnabled
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
    me {
      id
      address
    }
  }
`;

const PUBLISH_PRODUCT = gql`
  mutation PublishProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        status
      }
    }
  }
`;

export default function Preview() {
  const { data } = useQuery<PreviewDraftedProductQuery>(
    PREVIEW_DRAFTED_PRODUCT,
  );
  const [publishProduct, { loading: publishProductLoading }] = useMutation<
    PublishProductMutation,
    PublishProductMutationVariables
  >(PUBLISH_PRODUCT);

  const onPublishProduct = () => {
    if (!data?.getDraftedProduct || publishProductLoading) {
      return null;
    }
    publishProduct({
      variables: {
        input: {
          id: data.getDraftedProduct.id,
          status: ProductStatusEnum.Published,
        },
      },
      onCompleted: (data) => {
        router.replace({
          pathname: "/product",
          params: { productId: data.updateProduct.product.id },
        });
      },
    });
  };

  if (!data) {
    return <LoadingSpinner />;
  }
  if (!data.getDraftedProduct) {
    router.replace("/");
    return null;
  }

  const product = data.getDraftedProduct;
  const project = product?.project;
  const approximatePlace = project
    ? project.approximatePlace
    : data.getDraftedProduct.approximatePlace;

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog3={100}
        />
      }
      footerComponent={
        <View
          style={{
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            paddingTop: 24,
          }}
        >
          <Button
            icon="arrowLeft"
            label="Tillbaka"
            onPress={() => router.navigate("/sell-product/transportation")}
          />
          <Button
            label="Publicera annons"
            onPress={onPublishProduct}
            loading={publishProductLoading}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <ImageCarousel images={data.getDraftedProduct.images} />
      <MainContent
        product={data.getDraftedProduct}
        project={data.getDraftedProduct.project ?? undefined}
        category={data.getDraftedProduct.category}
        parentCategory={data.getDraftedProduct.category?.parent}
        documents={data.getDraftedProduct.documents}
        myAddress={data.me.address}
      />
      <Divider />
      <AllImages images={product.images} />
      {approximatePlace && data.getDraftedProduct.pickupEnabled && (
        <PickupPosition
          address={approximatePlace.address}
          location={{
            lat: approximatePlace.lat,
            lng: approximatePlace.lng,
          }}
        />
      )}
    </ScreenLayout>
  );
}
