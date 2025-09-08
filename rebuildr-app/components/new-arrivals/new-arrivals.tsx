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
import { useUser } from "@hooks/useUser";

const NEW_ARRIVALS = gql`
  query NewArrivals(
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
        }
        seller {
          id
        }
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

export const NewArrivals = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { setSorting } = useFilterProduct();
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const { isLoggedIn } = useUser();

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
        isLoggedIn,
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
          if (location) {
            setSorting(OrderProductsEnum.Distance, true);
          } else {
            setSorting(OrderProductsEnum.Latest, true);
          }
          router.navigate("/(app)/(tabs)/search/products");
        }}
        renderItem={({ item }) => {
          return (
            <AdGrid
              id={item.id}
              imageUri={item.primaryImage?.url}
              liked={!!item.likedByMe}
              heart={item.seller.id !== data.me?.id}
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
