import { View, useWindowDimensions } from "react-native";
import React from "react";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { gql, useQuery } from "@apollo/client";
import {
  RecommendedProductsQuery,
  RecommendedProductsQueryVariables,
  ProductsRecommendationSourceEnum,
  ProductAvailabilityEnum,
  Category,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { SectionHeader } from "@components/sections/section-header";
import { AdGrid } from "@components/ad/ad-grid";
import { Divider } from "@components/dividers/divider";
import { router } from "expo-router";
import { useScreenType } from "@hooks/useScreenType";
import {
  SCREEN_HORIZONTAL_MARGIN_DESKTOP,
  SCREEN_HORIZONTAL_MARGIN_MOBILE,
} from "@components/screen-layout/screen-layout";
import { GRID_CARD, MAX_CONTENT_WIDTH } from "@constants/layout";
import { getGridColumns } from "@/utils/grid";

type Props = {
  title: string;
  source: ProductsRecommendationSourceEnum;
};

const RECOMMENDED_PRODUCTS = gql`
  query RecommendedProducts(
    $input: RecommendedProductsInput!
    $limit: Int
    $offset: Int
  ) {
    me {
      id
      recommendedProducts(input: $input, limit: $limit, offset: $offset) {
        id
        title
        status
        availability
        price
        soldByQuantity
        condition
        primaryQuantity
        primaryUnit
        likedByMe
        brand {
          id
          name
        }
        primaryImage {
          id
          url
        }
        category {
          id
          name
          parentId
        }
        approximatePlace {
          address
        }
        seller {
          id
          type
          rating
        }
      }
    }
  }
`;

export function RecommendedProducts({ title, source }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { onToggleProductHeart } = useLikeProduct();
  const { filterBuilder } = useFilterProduct();
  const { isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<
    RecommendedProductsQuery,
    RecommendedProductsQueryVariables
  >(RECOMMENDED_PRODUCTS, {
    variables: {
      input: {
        recommendationSource: source,
        excludeOwnProducts: true,
      },
      limit: 10,
      offset: 0,
    },
    skip: !isLoggedIn,
  });

  if (!data || data.me.recommendedProducts.length < 1) return null;
  const products = data.me.recommendedProducts;
  const columngap = 16;
  // The home feed is capped and centered on wide screens, so size cards against the
  // capped width and derive the column count from a target card size (not a fixed 4).
  const availableWidth =
    Math.min(screenWidth, MAX_CONTENT_WIDTH) -
    (isDesktop
      ? SCREEN_HORIZONTAL_MARGIN_DESKTOP
      : SCREEN_HORIZONTAL_MARGIN_MOBILE) *
      2;
  const productsPerRow = isDesktop
    ? getGridColumns(availableWidth, { ...GRID_CARD, gap: columngap })
    : 2;
  const width =
    (availableWidth - (productsPerRow - 1) * columngap) / productsPerRow;

  return (
    <View style={{ gap: 16, paddingTop: 16 }}>
      <SectionHeader
        onPress={() => {
          const categories = products
            .filter((p) => !!p.category)
            .map((p) => p.category as Category);

          filterBuilder.setCategories(categories).apply();
          router.navigate("/search/products");
        }}
        buttonTitle={isDesktop ? "Visa alla" : undefined}
      >
        {title}
      </SectionHeader>

      <View
        style={{
          flexDirection: "row",
          gap: columngap,
          flexWrap: "wrap",
          paddingBottom: 16,
        }}
      >
        {products.map((product) => {
          return (
            <View style={{ width }} key={product.id}>
              <AdGrid
                id={product.id}
                imageUri={product.primaryImage?.url}
                liked={!!product.likedByMe}
                heart={product.seller.id !== data.me.id}
                quantity={product.primaryQuantity}
                quantityUnit={product.primaryUnit}
                condition={product.condition}
                account={{
                  rating: product.seller.rating,
                  type: product.seller.type,
                  location: product.approximatePlace?.address,
                }}
                title={product.title}
                price={product.price}
                soldByQuantity={product.soldByQuantity}
                status={product.status}
                upcoming={
                  product.availability === ProductAvailabilityEnum.Upcoming
                }
                onHeartPress={() => {
                  onToggleProductHeart({
                    productId: product.id,
                    likedByMe: !!product.likedByMe,
                  });
                }}
              />
            </View>
          );
        })}
      </View>
      {source === ProductsRecommendationSourceEnum.Likes && <Divider />}
    </View>
  );
}
