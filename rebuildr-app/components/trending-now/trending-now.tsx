import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { gql, useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import {
  OrderProductsEnum,
  TrendingNowProductsQuery,
  TrendingNowProductsQueryVariables,
} from "@/gql/graphql";

const TRENDING_NOW_QUERY = gql`
  query TrendingNowProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
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
        }
      }
    }
  }
`;

export const TrendingNow = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { setCategories } = useFilterProduct();

  const { data } = useQuery<
    TrendingNowProductsQuery,
    TrendingNowProductsQueryVariables
  >(TRENDING_NOW_QUERY, {
    variables: {
      input: {
        orderBy: OrderProductsEnum.Latest,
        selectionCategories: true,
      },
      limit: 10,
      offset: 0,
    },
  });

  return (
    <HoriztalListSection
      title="Trendar nu"
      data={data?.products.products ?? []}
      onPress={() => {
        const categoryIds: string[] = [];

        data?.products?.products?.forEach((product) => {
          if (product.category?.id) {
            categoryIds.push(product.category.id);
          }
        });

        setCategories(categoryIds);
        router.navigate("/(app)/(tabs)/search/products");
      }}
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
  );
};
