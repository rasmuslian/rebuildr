import { View, useWindowDimensions } from "react-native";
import React from "react";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { gql, useQuery } from "@apollo/client";
import {
  RecommendedProductsQuery,
  RecommendedProductsQueryVariables,
  ProductsRecommendationSourceEnum,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { SectionHeader } from "@components/sections/section-header";
import { AdGrid } from "@components/ad/ad-grid";
import { Divider } from "@components/dividers/divider";

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
        price
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
  const { isLoggedIn } = useUser();

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
  const width = (screenWidth - 48) / 2;

  return (
    <View style={{ gap: 16, paddingTop: 16 }}>
      <SectionHeader onPress={() => {}}>{title}</SectionHeader>

      <View
        style={{
          flexDirection: "row",
          gap: 16,
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
                heart
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
                status={product.status}
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

      <Divider />
    </View>
  );
}
