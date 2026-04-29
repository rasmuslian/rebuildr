import React from "react";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { ProductListQuery, ProductListQueryVariables } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { ProductEmptyState } from "@components/profile/product-empty-state";

export const PRODUCT_LIST = gql`
  query ProductList($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
        title
        price
        soldByQuantity
        condition
        primaryQuantity
        primaryUnit
        likedByMe
        primaryImage {
          id
          url
        }
        approximatePlace {
          address
        }
        seller {
          id
          rating
          type
        }
      }
      total
    }
    me {
      id
    }
  }
`;

export default function ProductList() {
  const PRODUCTS_PER_PAGE = 10;

  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { onToggleProductHeart } = useLikeProduct();

  const { isDesktop } = useScreenType();

  const { data, loading, fetchMore } = useQuery<
    ProductListQuery,
    ProductListQueryVariables
  >(PRODUCT_LIST, {
    variables: {
      input: { sellerId: userId },
      limit: PRODUCTS_PER_PAGE,
      offset: 0,
    },
  });

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: PRODUCTS_PER_PAGE,
        offset: Math.ceil(
          (data?.products.products?.length ?? 0) / PRODUCTS_PER_PAGE,
        ),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products?.products.length) return prev;

        return {
          products: {
            ...prev.products,
            ...fetchMoreResult.products,
            products: [
              ...prev.products.products,
              ...fetchMoreResult.products.products,
            ],
          },
          me: {
            ...prev.me,
          },
        };
      },
    });
  };

  const products = data?.products.products ?? [];
  const numberOfProducts = data?.products.total ?? 0;
  const sellerIsMe = data?.me.id === userId;

  return (
    <ScreenLayout
      headerComponent={
        isDesktop ? (
          <TopBar theme="light" />
        ) : (
          <Header title={sellerIsMe ? "Dina annonser" : "Annonser"} />
        )
      }
      loading={loading}
    >
      {numberOfProducts > 0 ? (
        <AdGridSection
          header={isDesktop ? "Dina annonser" : undefined}
          products={products.map((product) => ({
            id: product.id,
            status: product.status,
            imageUri: product.primaryImage?.url,
            title: product.title,
            quantity: product.primaryQuantity,
            quantityUnit: product.primaryUnit,
            condition: product.condition,
            account: {
              rating: product.seller.rating,
              type: product.seller.type,
              location: product.approximatePlace?.address,
            },
            price: product.price,
            soldByQuantity: product.soldByQuantity,
            heart: data?.me?.id !== userId,
            liked: !!product.likedByMe,
            onHeartPress: () => {
              onToggleProductHeart({
                productId: product.id,
                likedByMe: !!product.likedByMe,
              });
            },
          }))}
          pagination={{
            onShowMore,
            loading,
            total: data?.products.total ?? 0,
          }}
        />
      ) : (
        <ProductEmptyState sellerIsMe={sellerIsMe} />
      )}
    </ScreenLayout>
  );
}
