import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { gql, useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import { useUser } from "@hooks/useUser";
import { SectionHeader } from "@components/sections/section-header";
import {
  Category,
  OrderProductsEnum,
  TrendingNowProductsQuery,
  TrendingNowProductsQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { permanentSection } from "@constants/permanent-sections";
import { Divider } from "@components/dividers/divider";

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
        likedByMe
        primaryQuantity
        primaryUnit
        condition
        price
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
  const { width: screenWidth } = useWindowDimensions();
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
  const width = isDesktop
    ? (screenWidth - 75 * 2) / 6 - 16
    : (screenWidth - 48) / 2 - 16;

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
                status={item.status}
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
        <View style={{ gap: 16, paddingTop: 16 }}>
          <SectionHeader
            onPress={onPress}
            buttonTitle={isDesktop ? "Visa alla" : undefined}
          >
            Trendar nu
          </SectionHeader>

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
                    heart={product.seller.id !== data.me?.id}
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
        </View>
      )}
      <Divider />
    </View>
  );
};
