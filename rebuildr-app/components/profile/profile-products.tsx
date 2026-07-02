import { View } from "react-native";
import React from "react";
import { PROFILE_PRODUCTS } from "queries";
import { useQuery } from "@apollo/client";
import {
  ProductAvailabilityEnum,
  ProfileProductsQuery,
  ProfileProductsQueryVariables,
  ProfileQuery,
} from "@/gql/graphql";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ProductEmptyState } from "./product-empty-state";

type Props = {
  isMyProfile: boolean;
  profileQuery: {
    data: ProfileQuery;
    loading: boolean;
  };
};

export default function ProfileProducts({ isMyProfile, profileQuery }: Props) {
  const PRODUCTS_PER_PAGE = 10;
  const { onToggleProductHeart } = useLikeProduct();

  const user = profileQuery.data.user;
  const me = profileQuery.data.me;

  const {
    data,
    loading: profileProductsLoading,
    fetchMore,
  } = useQuery<ProfileProductsQuery, ProfileProductsQueryVariables>(
    PROFILE_PRODUCTS,
    {
      variables: {
        input: { sellerId: user.id },
        limit: PRODUCTS_PER_PAGE,
        offset: 0,
      },
    },
  );

  const products = data?.products.products ?? [];
  const numberOfProducts = data?.products.total ?? 0;

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
        };
      },
    });
  };

  if (profileQuery.loading) return <LoadingSpinner />;

  return (
    <View style={{ gap: 24, marginTop: 16 }}>
      {numberOfProducts > 0 ? (
        <AdGridSection
          header="Annonser"
          products={products.map((product) => ({
            id: product.id,
            status: product.status,
            upcoming: product.availability === ProductAvailabilityEnum.Upcoming,
            imageUri: product.primaryImage?.url,
            title: product.title,
            quantity: product.primaryQuantity,
            condition: product.condition,
            account: {
              rating: user.rating,
              type: user.type,
              location: product.approximatePlace?.address,
            },
            price: product.price,
            soldByQuantity: product.soldByQuantity,
            heart: me?.id !== user.id,
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
            loading: profileProductsLoading,
            total: numberOfProducts,
          }}
        />
      ) : (
        <ProductEmptyState sellerIsMe={isMyProfile} />
      )}
    </View>
  );
}
