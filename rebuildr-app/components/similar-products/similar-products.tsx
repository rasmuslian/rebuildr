import React from "react";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { gql, useQuery } from "@apollo/client";
import {
  Category,
  SimilarProductsQuery,
  SimilarProductsQueryVariables,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  productId: string;
};

const SIMILAR_PRODUCTS = gql`
  query SimilarProducts(
    $input: GetProductInput!
    $limit: Int
    $offset: Int
    $isLoggedIn: Boolean!
  ) {
    product(input: $input) {
      id
      similarProducts(limit: $limit, offset: $offset) {
        products {
          id
          title
          status
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
        total
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

export function SimilarProducts({ productId }: Props) {
  const { filterBuilder } = useFilterProduct();
  const { isDesktop } = useScreenType();
  const { onToggleProductHeart } = useLikeProduct();
  const { isLoggedIn } = useUser();

  const { data, fetchMore, loading } = useQuery<
    SimilarProductsQuery,
    SimilarProductsQueryVariables
  >(SIMILAR_PRODUCTS, {
    variables: {
      input: {
        id: productId,
      },
      limit: isDesktop ? 8 : 10,
      offset: 0,
      isLoggedIn,
    },
  });
  const productsPerPage = 10;

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        offset: Math.ceil(
          (data?.product.similarProducts.products.length ?? 0) /
            productsPerPage,
        ),
        limit: productsPerPage,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.product.similarProducts.products.length)
          return prev;

        return {
          product: {
            ...prev.product,
            ...fetchMoreResult.product,
            similarProducts: {
              products: [
                ...prev.product.similarProducts.products,
                ...fetchMoreResult.product.similarProducts.products,
              ],
              total: fetchMoreResult.product.similarProducts.total,
            },
          },
        };
      },
    });
  };

  if (!data || data.product.similarProducts.products.length < 1) return null;
  const products = data.product.similarProducts.products;

  const adGridProducts = products.map((product) => ({
    id: product.id,
    imageUri: product.primaryImage?.url,
    liked: !!product.likedByMe,
    heart: true,
    quantity: product.primaryQuantity,
    quantityUnit: product.primaryUnit,
    condition: product.condition,
    title: product.title,
    price: product.price,
    status: product.status,
    onHeartPress: () => {
      onToggleProductHeart({
        productId: product.id,
        likedByMe: !!product.likedByMe,
      });
    },
  }));

  return (
    <AdGridSection
      header="Du kanske gillar"
      onHeaderPress={() => {
        const categories = products
          .filter((p) => !!p.category)
          .map((p) => p.category as Category);

        filterBuilder.setCategories(categories).apply();
        router.navigate("/search/products");
      }}
      products={adGridProducts}
      pagination={{
        onShowMore,
        total: data?.product.similarProducts.total ?? 0,
        loading,
      }}
    />
  );
}
