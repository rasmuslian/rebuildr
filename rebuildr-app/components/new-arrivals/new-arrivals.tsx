import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { gql, useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router, useFocusEffect } from "expo-router";
import { View } from "react-native";
import {
  LocationObjectCoords,
  PermissionStatus,
  getForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { useState, useCallback } from "react";
import {
  OrderProductsEnum,
  NewArrivalsQuery,
  NewArrivalsQueryVariables,
} from "@/gql/graphql";

const NEW_ARRIVALS = gql`
  query NewArrivals($input: ProductsInput!, $limit: Int, $offset: Int) {
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

export const NewArrivals = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { setCategories } = useFilterProduct();
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { status } = await getForegroundPermissionsAsync();
        if (status !== PermissionStatus.GRANTED) return;

        const { coords } = await getCurrentPositionAsync();
        setLocation(coords);
      })();
    }, []),
  );

  const { data } = useQuery<NewArrivalsQuery, NewArrivalsQueryVariables>(
    NEW_ARRIVALS,
    {
      variables: {
        input: {
          excludeOwnProducts: true,
          orderBy: location
            ? OrderProductsEnum.Distance
            : OrderProductsEnum.Latest,

          location: location && {
            lat: location?.latitude,
            lng: location?.longitude,
          },
        },
        limit: 10,
        offset: 0,
      },
    },
  );

  if (!data || data.products.products.length < 1) return null;

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <HoriztalListSection
        title={location ? "Nyinkomna varor nära dig" : "Nyinkomna varor"}
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
