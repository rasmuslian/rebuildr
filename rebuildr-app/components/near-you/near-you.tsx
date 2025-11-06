import { useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router, useFocusEffect } from "expo-router";
import {
  LocationObjectCoords,
  PermissionStatus,
  getForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { useState, useCallback } from "react";
import {
  OrderProductsEnum,
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

export const NearYou = () => {
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

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          excludeOwnProducts: true,
          orderBy: OrderProductsEnum.Distance,
          location: location && {
            lat: location?.latitude,
            lng: location?.longitude,
          },
        },
        limit: isDesktop ? 4 : 10,
        offset: 0,
        isLoggedIn,
      },
    },
  );

  if (!location) return null;

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <AdRowSection
      data={data}
      title="Varor nära dig"
      onPress={() => {
        setSorting(OrderProductsEnum.Distance, true);
        router.navigate("/(app)/(tabs)/search/products");
      }}
    />
  );
};
