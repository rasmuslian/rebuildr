import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { gql, useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View } from "react-native";
import { useUser } from "@hooks/useUser";
import {
  Category,
  OrderProductsEnum,
  ProductAvailabilityEnum,
  TrendingNowProductsQuery,
  TrendingNowProductsQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { permanentSection } from "@constants/permanent-sections";
import { Divider } from "@components/dividers/divider";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";

const TRENDING_NOW_QUERY = gql`
  query TrendingNowProducts(
    $input: ProductsInput!
    $limit: Int
    $offset: Int
    $isLoggedIn: Boolean!
  ) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        title
        status
        availability
        likedByMe
        primaryQuantity
        primaryUnit
        condition
        price
        soldByQuantity
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
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

export const TrendingNow = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { filterBuilder } = useFilterProduct();
  const { isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<
    TrendingNowProductsQuery,
    TrendingNowProductsQueryVariables
  >(TRENDING_NOW_QUERY, {
    variables: {
      input: {
        orderBy: OrderProductsEnum.Latest,
        selectionCategories: true,
        excludeOwnProducts: true,
      },
      limit: isDesktop ? 6 : 10,
      offset: 0,
      isLoggedIn,
    },
  });

  if (!data || data.products.products.length < 1) return null;
  const products = data.products.products;

  const onPress = () => {
    const categories = products
      .filter((p) => !!p.category)
      .map((p) => p.category as Category);

    filterBuilder.reset().setCategories(categories).apply();
    router.navigate({ pathname: "/search/products/trending-now" });
  };

  return (
    <View style={{ gap: 16, paddingTop: 16 }}>
      {isLoggedIn && !isDesktop ? (
        <HoriztalListSection
          title={permanentSection.trendingNow.title}
          data={products}
          onPress={onPress}
          renderItem={({ item }) => {
            return (
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
                soldByQuantity={item.soldByQuantity}
                status={item.status}
                upcoming={
                  item.availability === ProductAvailabilityEnum.Upcoming
                }
                onHeartPress={() => {
                  onToggleProductHeart({
                    productId: item.id,
                    likedByMe: !!item.likedByMe,
                  });
                }}
              />
            );
          }}
          visibleItems={3}
        />
      ) : (
        <View style={{ paddingTop: 16 }}>
          <AdGridSection
            header="Trendar nu"
            onHeaderPress={onPress}
            products={
              data?.products.products.map((product) => ({
                id: product.id,
                imageUri: product.primaryImage?.url,
                title: product.title,
                quantity: product.primaryQuantity,
                condition: product.condition,
                account: {
                  rating: product.seller.rating,
                  type: product.seller.type,
                  location: product.approximatePlace?.address,
                },
                price: product.price,
                soldByQuantity: product.soldByQuantity,
                status: product.status,
                upcoming:
                  product.availability === ProductAvailabilityEnum.Upcoming,
                heart: product.seller.id !== data.me?.id,
                liked: !!product.likedByMe,
                onHeartPress: () => {
                  onToggleProductHeart({
                    productId: product.id,
                    likedByMe: !!product.likedByMe,
                  });
                },
              })) ?? []
            }
          />
        </View>
      )}
      <Divider />
    </View>
  );
};
