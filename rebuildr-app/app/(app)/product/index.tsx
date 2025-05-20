import { isLoggedInVar } from "@/apollo/config";
import {
  ProductViewLikeProductMutation,
  ProductViewLikeProductMutationVariables,
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
import { Body, Headline, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import BuyersProtection from "@assets/svgs/buyers-protection.svg";
import { Image } from "expo-image";
import { Check } from "@components/controls/check";
import { primitives } from "@constants/colors";
import dayjs from "dayjs";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/cards/ad-grid";
import { UserCard } from "@components/cards/user-card";
import { ProjectCard } from "@components/cards/project-card";

const PRODUCT_VIEW = gql`
  query ProductView($input: GetProductInput!, $isLoggedIn: Boolean!) {
    product(input: $input) {
      id
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
        products {
          id
          title
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
    me @include(if: $isLoggedIn) {
      id
      address
    }
  }
`;

const PRODUCT_VIEW_LIKE_PRODUCT = gql`
  mutation ProductViewLikeProduct($input: SetLikeProductInput!) {
    setLikeProduct(input: $input) {
      id
      likedByMe
    }
  }
`;

export default function Product() {
  const isLoggedIn = isLoggedInVar();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useQuery<ProductViewQuery, ProductViewQueryVariables>(
    PRODUCT_VIEW,
    {
      variables: { input: { id: productId }, isLoggedIn },
    },
  );
  const [setLikeProduct, { loading: loadingLikeProduct }] = useMutation<
    ProductViewLikeProductMutation,
    ProductViewLikeProductMutationVariables
  >(PRODUCT_VIEW_LIKE_PRODUCT);
  const colors = useThemeColor();

  if (!data) {
    return <LoadingSpinner />;
  }

  const onLikeProduct = () => {
    if (!data || !isLoggedIn || loadingLikeProduct) {
      return;
    }
    setLikeProduct({
      variables: {
        input: {
          id: productId,
          like: !data.product.likedByMe,
        },
      },
    });
  };

  const approximatePlace = data.product.project
    ? data.product.project.approximatePlace
    : data.product.approximatePlace;
  const isMyProduct = data.me?.id === data.product.seller.id;

  return (
    <ScreenLayout
      headerComponent={
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Button
              icon="arrowLeft"
              type="text"
              onPress={() =>
                router.canGoBack() ? router.back() : router.navigate("/")
              }
            />
          </View>
          <Button
            icon="upload"
            type="text"
            onPress={() => {
              //TODO: share function
            }}
          />
          {isLoggedIn && !isMyProduct && (
            <Button
              icon={data.product.likedByMe ? "heartFilled" : "heart"}
              type="text"
              onPress={onLikeProduct}
            />
          )}
        </View>
      }
      footerComponent={
        <View style={{ gap: 8, paddingTop: 24 }}>
          {isMyProduct ? (
            <>
              <Button
                label="Redigera annons"
                onPress={() => {
                  //TODO: navigate to edit product screen
                }}
              />
              <Button
                label="Radera annons"
                type="tonal"
                disabled={!data.product.canDelete}
                onPress={() => {
                  //TODO: delete product
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
                  //TODO: navigate to chat with Seller
                }}
              />
            </>
          )}
        </View>
      }
      style={{ gap: 24 }}
    >
      <ImageCarousel images={data.product.images} />
      <MainContent
        product={data.product}
        project={data.product.project ?? undefined}
        documents={data.product.documents}
        category={data.product.category}
        parentCategory={data.product.category?.parent}
        myAddress={data.me?.address}
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
            color={primitives.primary300}
          />
          <Body size="medium">Ersättning om varan inte levereras</Body>
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Check
            checkColor="primaryDark"
            selected
            color={primitives.primary300}
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
          isBusiness={data.product.seller.type === UserType.Business}
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
      )}
      <Divider />
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Headline size="small">Mer från samma säljare</Headline>
          <Button
            icon="arrowRight"
            type="text"
            onPress={() => {
              //TODO: navigate to profile with product tab selected
            }}
          />
        </View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={{
            paddingBottom: 24,
          }}
          data={data.product.seller.products}
          contentContainerStyle={{ gap: 16 }}
          horizontal
          renderItem={({ item: product }) => (
            <AdGrid
              imageUri={product.primaryImage?.url}
              liked={!!product.likedByMe}
              heart
              quantity={product.primaryQuantity ?? 0}
              quantityUnit={product.primaryUnit ?? undefined}
              condition={product.condition}
              title={product.title}
              price={product.price}
              onPress={() => {
                router.navigate({
                  pathname: "/(app)/product",
                  params: { productId: product.id },
                });
              }}
            />
          )}
        />
      </View>
    </ScreenLayout>
  );
}
