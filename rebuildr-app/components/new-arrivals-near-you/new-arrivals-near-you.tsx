import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { gql, useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { View } from "react-native";
import {
  OrderProductsEnum,
  NewArrivalsNearYouQuery,
  NewArrivalsNearYouQueryVariables,
} from "@/gql/graphql";

const NEW_ARRIVALS_NEAR_YOU = gql`
  query NewArrivalsNearYou($input: ProductsInput!, $limit: Int, $offset: Int) {
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

export const NewArrivalsNearYou = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { setCategories } = useFilterProduct();
  const { location } = useLocationAddress();

  const { data } = useQuery<
    NewArrivalsNearYouQuery,
    NewArrivalsNearYouQueryVariables
  >(NEW_ARRIVALS_NEAR_YOU, {
    variables: {
      input: {
        orderBy: OrderProductsEnum.Distance,
        location: {
          lat: location[0],
          lng: location[1],
        },
      },
      limit: 10,
      offset: 0,
    },
  });

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <HoriztalListSection
        title="Nyinkomna varor nära dig"
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
    </View>
  );
};
