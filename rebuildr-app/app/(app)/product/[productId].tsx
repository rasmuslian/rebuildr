import {
  ProductRemoveProductMutation,
  ProductRemoveProductMutationVariables,
  ProductStatusEnum,
  ProductViewQuery,
  ProductViewQueryVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { AllImages } from "@components/preview-product/all-images";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline } from "@components/typography/text";
import { router, useLocalSearchParams } from "expo-router";
import { View, Platform } from "react-native";
import dayjs from "dayjs";
import { Button, ButtonProps } from "@components/buttons/button";
import { AdGrid } from "@components/ad/ad-grid";
import { UserCard } from "@components/cards/user-card";
import { ProjectCard } from "@components/cards/project-card";
import { Header } from "@components/navigation/headers/header";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useContext, useRef, useState } from "react";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { BuyersProtection } from "@components/buyers-protection/buyers-protection";
import { CreateProductLabelModal } from "@components/modals/create-product-label-modal";
import { usePersistedState } from "@hooks/use-persisted-state";
import { useUser } from "@hooks/useUser";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ReportProductBottomSheet } from "@components/report/report-product-bottom-sheet";
import { LoginModalContext } from "@context/loginModalContext";
import { SimilarProducts } from "@components/similar-products/similar-products";

type StateType = {
  showCreateLabelModal: boolean;
};

const initialState: StateType = {
  showCreateLabelModal: true,
};

const PRODUCT_VIEW_FRAGMENT = gql`
  fragment ProductViewFragment on Product {
    id
    status
    createdAt
    updatedAt
    canDelete
    likedByMe
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
    hasOngoingPurchase(includeOwnPurchases: true)
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
      likedByMe
      projectPicture {
        id
        url
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
      products {
        id
        status
        primaryImage {
          id
          url
        }
      }
      user {
        id
        profilePicture {
          id
          url
        }
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
    seller {
      id
      type
      username
      rating
      numberOfPublishedProducts
      numberOfSoldProducts
      profilePicture {
        id
        url
      }
      products {
        id
        title
        status
        likedByMe
        primaryQuantity
        primaryUnit
        condition
        price
        primaryImage {
          id
          url
        }
      }
    }
  }
`;

const PRODUCT_VIEW = gql`
  query ProductView($input: GetProductInput!, $isLoggedIn: Boolean!) {
    product(input: $input) {
      ...ProductViewFragment
    }
    me @include(if: $isLoggedIn) {
      id
      address
      type
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

const PRODUCT_REMOVE_PRODUCT = gql`
  mutation ProductRemoveProduct($input: RemoveProductInput!) {
    removeProduct(input: $input) {
      ...ProductViewFragment
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

export default function Product() {
  const [state, setState] = usePersistedState("product-state", initialState);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const { onToggleProductHeart } = useLikeProduct();
  const { isLoggedIn } = useUser();
  const removeProductRef = useRef<BottomSheetModal>(null);
  const createProductLabelRef = useRef<BottomSheetModal>(null);
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { setVisible } = useContext(LoginModalContext);

  const { data } = useQuery<ProductViewQuery, ProductViewQueryVariables>(
    PRODUCT_VIEW,
    {
      variables: { input: { id: productId }, isLoggedIn },
    },
  );
  const [removeProduct, { loading: loadingRemoveProduct }] = useMutation<
    ProductRemoveProductMutation,
    ProductRemoveProductMutationVariables
  >(PRODUCT_REMOVE_PRODUCT);

  if (!data) return <LoadingSpinner />;
  const product = data.product;
  const me = data.me;

  const approximatePlace = product.project
    ? product.project.approximatePlace
    : product.approximatePlace;

  const isMyProduct = me?.id === product.seller.id;

  const otherProducts = product.seller.products.filter(
    (product) => product.id !== productId,
  );

  const buyButtonDisabled = !me || me.type === UserType.Business;

  const printProductLabel = async () => {
    if (Platform.OS === "web") {
      const printWindow = window.open(`/product-label/${productId}`, "_blank");
      if (!printWindow) return;

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.onafterprint = () => printWindow.close();
          printWindow.print();
        }, 500);
      };
    } else {
      const response = await fetch(`/product-label/${productId}`);
      const html = await response.text();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    }
  };

  const ctas: ButtonProps[] = [];

  if (isMyProduct) {
    ctas.push({
      icon: "qrCode",
      label: "Skapa etikett",
      type: "tonal",
      iconPosition: "right",
      onPress: () => {
        if (state.showCreateLabelModal) {
          createProductLabelRef.current?.present();
        } else {
          printProductLabel();
        }
      },
    });
  }

  if (!isMyProduct && isLoggedIn) {
    ctas.push({
      icon: product.likedByMe ? "heartFilled" : "heart",
      onPress: () => {
        onToggleProductHeart({
          productId,
          likedByMe: !!product.likedByMe,
        });
      },
    });
  }

  return (
    <>
      <ScreenLayout
        headerComponent={<Header showDivider={false} ctas={ctas} />}
        footerComponent={
          <View style={{ gap: 8, paddingTop: 24 }}>
            {isMyProduct ? (
              <>
                <Button
                  label="Redigera annons"
                  onPress={() => {
                    //TODO: navigate to edit product screen
                    router.navigate({
                      pathname: "/product/edit/[productId]",
                      params: { productId },
                    });
                  }}
                />
                <Button
                  label="Radera annons"
                  type="tonal"
                  onPress={() => {
                    removeProductRef.current?.present();
                  }}
                />
              </>
            ) : (
              <>
                {data.product.status === ProductStatusEnum.Published && (
                  <Button
                    label="Köp nu"
                    onPress={() => {
                      router.navigate({
                        pathname: "/buy/[productId]",
                        params: { productId },
                      });
                    }}
                    disabled={buyButtonDisabled}
                  />
                )}
                <Button
                  label="Kontakta säljaren"
                  type="tonal"
                  onPress={() => {
                    router.navigate({
                      pathname: "/conversations/[productId]/[userId]",
                      params: { productId, userId: product.seller.id },
                    });
                  }}
                />
              </>
            )}
          </View>
        }
        style={{ gap: 24, marginTop: 8 }}
      >
        <ImageCarousel images={product.images} status={product.status} />
        <MainContent
          product={product}
          project={product.project ?? undefined}
          documents={product.documents}
          category={product.category}
          parentCategory={product.category?.parent}
          myAddress={me?.address}
          sellerIsMe={me && me.id === product.seller.id}
        />
        <Divider />
        <BuyersProtection />
        <AllImages images={product.images} />
        {approximatePlace && product.pickupEnabled && (
          <PickupPosition
            address={approximatePlace.address}
            location={{
              lat: approximatePlace.lat,
              lng: approximatePlace.lng,
            }}
          />
        )}
        <Divider />
        <View>
          <Body size="medium">
            Annonsen publiserades:{" "}
            {dayjs(product.createdAt).format("D MMM, YYYY")}
          </Body>
          <Body size="medium">
            Senast ändrad: {dayjs(product.updatedAt).format("D MMM, YYYY")}
          </Body>
          {!isMyProduct && (
            <Body
              size="medium"
              isLink
              style={{ marginTop: 16 }}
              onPress={() => {
                if (!isLoggedIn) {
                  setVisible(true);
                } else {
                  setShowReportSheet(true);
                }
              }}
            >
              Anmäl annonsen
            </Body>
          )}
        </View>
        <Divider />
        <View style={{ gap: 24 }}>
          <Headline size="small">Om säljaren</Headline>
          <UserCard
            userType={product.seller.type}
            profilePictureUrl={product.seller.profilePicture?.url}
            username={product.seller.username ?? ""}
            numberOfPublishedProducts={product.seller.numberOfPublishedProducts}
            numberOfSoldProducts={product.seller.numberOfSoldProducts}
            rating={product.seller.rating}
          />
          <Button
            label="Visa profil"
            onPress={() => {
              router.navigate({
                pathname: "/(app)/account/profile",
                params: { userId: product.seller.id },
              });
            }}
          />
        </View>
        <Divider />
        {product.project && (
          <>
            <View style={{ gap: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Headline size="small">Mer från samma projekt</Headline>
                <Button
                  icon="arrowRight"
                  type="text"
                  onPress={() => {
                    if (!product.project) return;
                    router.navigate({
                      pathname: "/(app)/project/[projectId]",
                      params: { projectId: product.project.id },
                    });
                  }}
                />
              </View>
              <ProjectCard
                showHeart={data.me?.id !== product.project.user.id}
                project={product.project}
              />
            </View>
            <Divider />
          </>
        )}
        {!!otherProducts.length && (
          <HoriztalListSection
            title="Mer från samma säljare"
            data={otherProducts}
            onPress={() => {
              router.navigate({
                pathname: "/account/profile",
                params: { userId: product.seller.id },
              });
            }}
            renderItem={({ item }) => (
              <AdGrid
                id={item.id}
                imageUri={item.primaryImage?.url}
                liked={!!item.likedByMe}
                heart
                quantity={item.primaryQuantity}
                quantityUnit={item.primaryUnit}
                condition={item.condition}
                title={item.title}
                price={item.price}
                status={item.status}
                onHeartPress={() => {
                  onToggleProductHeart({
                    productId: item.id,
                    likedByMe: !!item.likedByMe,
                  });
                }}
              />
            )}
            visibleItems={3}
          />
        )}
        <SimilarProducts productId={productId} />
      </ScreenLayout>
      <BottomSheet
        ref={removeProductRef}
        name="removeProduct"
        title="Radera annons"
      >
        <View style={{ gap: 24 }}>
          {product.canDelete ? (
            <>
              <Display
                size="small"
                style={{ marginVertical: 24, textAlign: "center" }}
              >
                Är du säker på att du vill radera annonsen?
              </Display>
              <View style={{ gap: 8 }}>
                <Button
                  label="Ja, radera"
                  type="danger"
                  loading={loadingRemoveProduct}
                  onPress={() => {
                    if (loadingRemoveProduct) return;
                    removeProduct({
                      variables: { input: { id: productId } },
                      onCompleted: () => {
                        removeProductRef.current?.dismiss();
                        if (router.canGoBack()) {
                          router.back();
                        } else {
                          router.replace("/");
                        }
                      },
                    });
                  }}
                />
                <Button
                  label="Nej"
                  type="outlined"
                  onPress={() => {
                    removeProductRef.current?.dismiss();
                  }}
                />
              </View>
            </>
          ) : (
            <>
              <Display
                size="small"
                style={{ marginVertical: 24, textAlign: "center" }}
              >
                Du kan inte radera en annons under ett pågående köp
              </Display>
              <Button
                label="Ok"
                onPress={() => removeProductRef.current?.dismiss()}
              />
            </>
          )}
        </View>
      </BottomSheet>
      {!isMyProduct && (
        <ReportProductBottomSheet
          productId={productId}
          show={showReportSheet}
          onDismiss={() => setShowReportSheet(false)}
        />
      )}

      <CreateProductLabelModal
        modalRef={createProductLabelRef}
        onPressDontShowMore={() => {
          createProductLabelRef.current?.close();
          setState({ showCreateLabelModal: false });
        }}
        onPressPrintProductLabel={printProductLabel}
      />
    </>
  );
}
