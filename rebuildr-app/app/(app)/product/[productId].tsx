import { isLoggedInVar } from "@/apollo/config";
import {
  ProductRemoveProductMutation,
  ProductRemoveProductMutationVariables,
  ProductViewQuery,
  ProductViewQueryVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { AllImages } from "@components/preview-product/all-images";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import BuyersProtection from "@assets/svgs/buyers-protection.svg";
import { Image } from "expo-image";
import { Check } from "@components/controls/check";
import { primitives } from "@constants/colors";
import dayjs from "dayjs";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/ad/ad-grid";
import { UserCard } from "@components/cards/user-card";
import { ProjectCard } from "@components/cards/project-card";
import { Header } from "@components/navigation/headers/header";
import { IconType } from "@icons/icon";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { useLikeProduct } from "@hooks/useLikeProduct";

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
  const { onToggleProductHeart } = useLikeProduct();
  const isLoggedIn = isLoggedInVar();
  const removeProductRef = useRef<BottomSheetModal>(null);
  const { productId } = useLocalSearchParams<{ productId: string }>();
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
  const colors = useThemeColor();

  if (!data) {
    return <LoadingSpinner />;
  }

  const onLikeProduct = () => {
    if (!data) return;
    onToggleProductHeart({
      productId: productId,
      likedByMe: !!data.product.likedByMe,
    });
  };

  const approximatePlace = data.product.project
    ? data.product.project.approximatePlace
    : data.product.approximatePlace;
  const isMyProduct = data.me?.id === data.product.seller.id;

  const otherProducts = data.product.seller.products.filter(
    (product) => product.id !== data.product.id,
  );

  return (
    <>
      <ScreenLayout
        headerComponent={
          <Header
            showDivider={false}
            ctas={[
              {
                icon: "upload",
                onPress: () => {
                  //TODO: share function
                },
              },
              ...(isLoggedIn
                ? [
                    {
                      icon: (data.product.likedByMe
                        ? "heartFilled"
                        : "heart") as IconType,
                      onPress: onLikeProduct,
                    },
                  ]
                : []),
            ]}
          />
        }
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
                <Button
                  label="Köp nu"
                  onPress={() => {
                    //TODO: navigate to buy screen
                  }}
                />
                <Button
                  label="Kontakta säljaren"
                  type="tonal"
                  onPress={() => {
                    router.navigate({
                      pathname: "/conversations/[productId]/[userId]",
                      params: { productId, userId: data.product.seller.id },
                    });
                  }}
                />
              </>
            )}
          </View>
        }
        style={{ gap: 24, marginTop: 8 }}
      >
        <ImageCarousel images={data.product.images} />
        <MainContent
          product={data.product}
          project={data.product.project ?? undefined}
          documents={data.product.documents}
          category={data.product.category}
          parentCategory={data.product.category?.parent}
          myAddress={data.me?.address}
          sellerIsMe={data.me && data.me.id === data.product.seller.id}
        />
        <Divider />
        <View
          style={{
            borderRadius: borderRadius.medium,
            backgroundColor: colors.background.secondary,
            padding: 16,
            gap: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Title size="medium">
              Vårt köparskydd ingår alltid, utan extra kostnad
            </Title>
            <Image
              source={BuyersProtection.uri}
              style={{ width: 60, height: 60 }}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Check
              checkColor="primaryDark"
              selected
              color={primitives.primary200}
            />
            <Body size="medium">Ersättning om varan inte levereras</Body>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Check
              checkColor="primaryDark"
              selected
              color={primitives.primary200}
            />
            <Body size="medium">Ersättning om varan inte är som beskriven</Body>
          </View>
          <Body size="small" isLink>
            Läs hur vårt köparskydd fungerar.
          </Body>
        </View>
        <AllImages images={data.product.images} />
        {approximatePlace && data.product.pickupEnabled && (
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
            {dayjs(data.product.createdAt).format("D MMM, YYYY")}
          </Body>
          <Body size="medium">
            Senast ändrad: {dayjs(data.product.updatedAt).format("D MMM, YYYY")}
          </Body>
          <Body size="medium" isLink style={{ marginTop: 16 }}>
            Anmäl annonsen
          </Body>
        </View>
        <Divider />
        <View style={{ gap: 24 }}>
          <Headline size="small">Om säljaren</Headline>
          <UserCard
            userType={data.product.seller.type}
            profilePictureUrl={data.product.seller.profilePicture?.url}
            username={data.product.seller.username ?? ""}
            numberOfPublishedProducts={
              data.product.seller.numberOfPublishedProducts
            }
            numberOfSoldProducts={data.product.seller.numberOfSoldProducts}
            rating={data.product.seller.rating}
          />
          <Button
            label="Visa profil"
            onPress={() => {
              router.navigate({
                pathname: "/(app)/account/profile",
                params: { userId: data.product.seller.id },
              });
            }}
          />
        </View>
        <Divider />
        {data.product.project && (
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
                    //TODO: navigate to project
                  }}
                />
              </View>
              <ProjectCard project={data.product.project} />
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
                params: { userId: data.product.seller.id },
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
      </ScreenLayout>
      <BottomSheet
        ref={removeProductRef}
        name="removeProduct"
        title="Radera annons"
      >
        <View style={{ gap: 24, marginTop: 24 }}>
          {data.product.canDelete ? (
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
                    if (loadingRemoveProduct) {
                      return;
                    }
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
    </>
  );
}
