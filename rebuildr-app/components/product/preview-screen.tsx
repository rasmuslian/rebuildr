import {
  PreviewDraftedProductQuery,
  ProductPreviewPublishProductMutation,
  ProductPreviewPublishProductMutationVariables,
  ProductStatusEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router } from "expo-router";
import { View } from "react-native";
import { ProgressHeader } from "./progress-header";
import { Button } from "@components/buttons/button";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { Divider } from "@components/dividers/divider";
import { AllImages } from "@components/preview-product/all-images";
import { PickupPosition } from "@components/preview-product/pickup-position";

const PRODUCT_PREVIEW_PUBLISH_PRODUCT = gql`
  mutation ProductPreviewPublishProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        status
      }
    }
  }
`;

type Props = {
  product: Exclude<
    PreviewDraftedProductQuery["getDraftedProduct"],
    null | undefined
  >;
  myAddress?: string | null;
  title: string;
};

export const PreviewScreen = ({
  product: dbProduct,
  myAddress,
  title,
}: Props) => {
  const [publishProduct, { loading: publishProductLoading }] = useMutation<
    ProductPreviewPublishProductMutation,
    ProductPreviewPublishProductMutationVariables
  >(PRODUCT_PREVIEW_PUBLISH_PRODUCT);

  const onPublishProduct = () => {
    if (publishProductLoading) {
      return null;
    }
    publishProduct({
      variables: {
        input: {
          id: dbProduct.id,
          status: ProductStatusEnum.Published,
        },
      },
      onCompleted: (data) => {
        router.replace({
          pathname: "/product/[productId]",
          params: { productId: data.updateProduct.product.id },
        });
      },
    });
  };

  const product = dbProduct;
  const project = product?.project;
  const approximatePlace = project
    ? project.approximatePlace
    : dbProduct.approximatePlace;

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title={title}
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
      <ImageCarousel images={dbProduct.images} />
      <MainContent
        product={dbProduct}
        project={dbProduct.project ?? undefined}
        category={dbProduct.category}
        parentCategory={dbProduct.category?.parent}
        documents={dbProduct.documents}
        myAddress={myAddress}
      />
      <Divider />
      <AllImages images={product.images} />
      {approximatePlace && dbProduct.pickupEnabled && (
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
};
