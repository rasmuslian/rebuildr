import { useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
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
import { useLocationContext } from "@context/location-context";

export const NearYou = () => {
  const { setSorting } = useFilterProduct();
  const { isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();
  const { userCoords } = useLocationContext();

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          excludeOwnProducts: true,
          orderBy: OrderProductsEnum.Distance,
          location: userCoords && {
            lat: userCoords.latitude,
            lng: userCoords.longitude,
          },
        },
        limit: isDesktop ? 4 : 10,
        offset: 0,
        isLoggedIn,
        distanceFrom: userCoords
          ? {
              lat: userCoords.latitude,
              lng: userCoords.longitude,
            }
          : undefined,
      },
    },
  );

  if (!userCoords) return null;

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <AdRowSection
      data={data}
      title="Varor nära dig"
      onPress={() => {
        setSorting(OrderProductsEnum.Distance, true);
        router.navigate("/search/products");
      }}
    />
  );
};
