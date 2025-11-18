import { View } from "react-native";
import React from "react";
import { PROFILE_PRODUCTS } from "queries";
import { useQuery } from "@apollo/client";
import {
  ProfileProductsQuery,
  ProfileProductsQueryVariables,
  ProfileQuery,
} from "@/gql/graphql";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { router } from "expo-router";
import { useSellProductContext } from "@context/sell-product-context";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

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
  const { setVisible: setSellProductVisible } = useSellProductContext();

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
  const numbderOfProducts = data?.products.total ?? 0;

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
      {numbderOfProducts > 0 ? (
        <AdGridSection
          header="Annonser"
          products={products.map((product) => ({
            id: product.id,
            status: product.status,
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
            onShowMore: onShowMore,
            loading: profileProductsLoading,
            total: numbderOfProducts,
          }}
        />
      ) : (
        <EmptyStateCard
          header={
            isMyProfile ? "Inga annonser än" : "Inga annonser här just nu"
          }
          description={
            isMyProfile
              ? "Just nu har du inga annonser ute, men det är enkelt att komma igång"
              : "Den här säljaren har inga aktiva annonser för tillfället. Kika tillbaka senare eller utforska fler annonser på marknadsplatsen!"
          }
          cta={
            isMyProfile
              ? {
                  label: "Lägg upp en annons",
                  onPress: () => setSellProductVisible(true),
                }
              : {
                  label: "Se fler annonser",
                  onPress: () => router.navigate("/search"),
                }
          }
        />
      )}
    </View>
  );
}
