import { gql, useQuery } from "@apollo/client";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useFocusEffect } from "expo-router";
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
import { useScreenType } from "@hooks/useScreenType";
import { NewArrivalsMobile } from "./new-arrivals.mobile";
import { NewArrivalsDesktop } from "./new-arrivals.desktop";

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
  const { isDesktop } = useScreenType();

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

  if (isDesktop) {
    return (
      <NewArrivalsDesktop
        data={data}
        location={location}
        setSorting={setSorting}
        onToggleProductHeart={onToggleProductHeart}
      />
    );
  }
  return (
    <NewArrivalsMobile
      data={data}
      location={location}
      setSorting={setSorting}
      onToggleProductHeart={onToggleProductHeart}
    />
  );
}
