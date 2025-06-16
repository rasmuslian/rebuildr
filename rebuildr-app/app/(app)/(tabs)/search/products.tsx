import { isLoggedInVar } from "@/apollo/config";
import {
  SearchProductsQuery,
  SearchProductsQueryVariables,
} from "@/gql/graphql";
import { meterToKilometer } from "@/utils/conversions";
import { gql, useQuery } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/ad/ad-grid";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { ContinuousSlider } from "@components/slider/continuous-slider";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Display, Label } from "@components/typography/text";
import { defaultCenter, defaultRadius } from "@constants/map";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Map } from "@components/maps/map";
import { Check } from "@components/controls/check";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";

const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts(
    $input: ProductsInput!
    $limit: Int
    $offset: Int
    $isLoggedIn: Boolean!
  ) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        title
        price
        condition
        primaryQuantity
        primaryUnit
        likedByMe
        brand {
          id
          name
        }
        primaryImage {
          id
          url
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
      total
    }
    me @include(if: $isLoggedIn) {
      id
      location {
        lat
        lng
      }
      address
    }
  }
`;

export default function Products() {
  //Transportation variables
  const [pickup, setPickup] = useState(true);
  const [pickupDistance, setPickupDistance] = useState(defaultRadius);
  const [isMyLocation, setIsMyLocation] = useState(false);
  const [shipping, setShipping] = useState(true);
  const [delivery, setDelivery] = useState(true);

  const { searchString } = useLocalSearchParams<{ searchString: string }>();
  const { filter, nrOfAppliedFilters } = useFilterProduct();
  const isLoggedIn = isLoggedInVar();
  const productsPerPage = 10;
  const transportRef = useRef<BottomSheetModal>(null);

  const { data, loading, refetch, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    variables: {
      input: {
        searchString,
        orderBy: filter.sorting,
        categoryIds: filter.categoryIds,
        brandIds: filter.brandIds,
        conditions: filter.conditions,
        minPrice: filter.price[0],
        maxPrice: filter.price[1],
      },
      limit: productsPerPage,
      offset: 0,
      isLoggedIn,
    },
  });

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        offset: Math.ceil(
          (data?.products?.products.length ?? 0) / productsPerPage,
        ),
        limit: productsPerPage,
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

  //--------Transportation logic------------
  const { location, setMyLocation, setMapLocation } = useLocationAddress({
    location: data?.me?.location ?? {
      lat: defaultCenter[0],
      lng: defaultCenter[1],
    },
  });

  const onToggleMyLocation = () => {
    setIsMyLocation(!isMyLocation);
    if (!isMyLocation) {
      setMyLocation();
    }
  };
  const onMapMove = (lat: number, lng: number) => {
    setIsMyLocation(false);
    setMapLocation(lat, lng);
  };
  const onTogglePickup = () => {
    if (!pickup) {
      setPickup(true);
      return;
    }
    if (!delivery && !shipping) {
      return null;
    }
    setPickup(false);
  };
  const onToggleShipping = () => {
    if (!shipping) {
      setShipping(true);
      return;
    }
    if (!delivery && !pickup) {
      return null;
    }
    setShipping(false);
  };
  const onToggleDelivery = () => {
    if (!delivery) {
      setDelivery(true);
      return;
    }
    if (!pickup && !shipping) {
      return null;
    }
    setDelivery(false);
  };
  const getTransportationLabel = () => {
    if (pickup && delivery && shipping) {
      return "Alla leveranssätt";
    }
    if (
      (pickup && delivery) ||
      (pickup && shipping) ||
      (delivery && shipping)
    ) {
      return "Flera leveranssätt";
    }
    if (pickup) {
      return `Hämta själv • ${formatMetersToKm(pickupDistance)} km`;
    }
    if (shipping) {
      return "Fraktleverans";
    }
    if (delivery) {
      return "Hemtransport";
    }

    return "Inga leveranssätt";
  };
  //----------------------------

  const onApplyTranportationOptions = async () => {
    await refetch({
      input: {
        searchString,
        orderBy: filter.sorting,
        categoryIds: filter.categoryIds,
        brandIds: filter.brandIds,
        conditions: filter.conditions,
        minPrice: filter.price[0],
        maxPrice: filter.price[1],
        distance: pickup ? pickupDistance : undefined,
        location: pickup ? { lat: location[0], lng: location[1] } : undefined,
        pickup,
        shipping,
        delivery,
      },
    });
    transportRef.current?.dismiss();
  };

  return (
    <>
      <ScreenLayout
        loading={loading}
        style={{ marginTop: 24 }}
        headerComponent={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
            }}
          >
            <SearchBar
              style={{ flex: 1 }}
              placeholder="Vad letar du efter?"
              onFocus={() => router.navigate("/(app)/(tabs)/search")}
              onPressArrow={() =>
                router.canGoBack() ? router.back() : router.navigate("/")
              }
            />
          </View>
        }
      >
        {!!searchString && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Display size="small">“</Display>
            <Display size="small" numberOfLines={1} ellipsizeMode="tail">
              {searchString}
            </Display>
            <Display size="small">“</Display>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Body size="medium" style={{ flex: 1 }} color="secondary">
            {data?.products.total ?? 0}{" "}
            {data?.products.total === 1 ? "träff" : "träffar"}:
          </Body>
          <Button
            label={getTransportationLabel()}
            onPress={() => transportRef.current?.present()}
            type="tonal"
          />
          <View>
            <Button
              icon="filterList2"
              type="tonal"
              onPress={() => router.navigate("/search/filter")}
            />
            {!!nrOfAppliedFilters() && (
              <View style={{ position: "absolute", right: 1, top: 1 }}>
                <Badge text={`${nrOfAppliedFilters()}`} />
              </View>
            )}
          </View>
        </View>
        <AdGridSection
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
            })) ?? []
          }
          pagination={{
            onShowMore,
            total: data?.products.total ?? 0,
            loading,
          }}
        />
      </ScreenLayout>
      <BottomSheet
        ref={transportRef}
        name="delivery"
        title="Leveransalternativ"
      >
        <View style={{ gap: 16, marginTop: 24 }}>
          {/**Pickup */}
          <ToggleCard
            title="Hämta själv hos säljaren"
            description="Du hämtar varan själv genom att kontakta säljaren för att bestämma tid och plats."
            enabled={!!pickup}
            offColor="disabled"
            onPress={onTogglePickup}
          >
            {pickup && (
              <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                  <Label size="medium">Välj max avstånd från dig</Label>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <ContinuousSlider
                      min={1000}
                      max={80000}
                      value={pickupDistance}
                      onChange={(v) => setPickupDistance(v)}
                      width={240}
                    />
                    <Body size="medium">
                      {meterToKilometer(pickupDistance)} km
                    </Body>
                  </View>
                </View>
                <View style={{ gap: 12 }}>
                  <Map
                    lat={location[0]}
                    lng={location[1]}
                    zoomDisabled
                    zoom={10}
                    radius={pickupDistance}
                    onMoveEnd={onMapMove}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <Check selected={isMyLocation} onPress={onToggleMyLocation} />
                  <Body size="medium">Använd min plats</Body>
                </View>
              </View>
            )}
          </ToggleCard>

          {/**Shipping */}
          <ToggleCard
            title="Fraktleverans"
            description="Säljaren skickar varan till dig med ett transportbolag."
            enabled={shipping}
            onPress={onToggleShipping}
            offColor="disabled"
          />

          {/**Delivery */}
          <ToggleCard
            title="Hemtransport"
            description="Säljaren erbjuder hemleverans till dig."
            enabled={delivery}
            onPress={onToggleDelivery}
            offColor="disabled"
          />

          <Button
            label="Spara"
            onPress={() => onApplyTranportationOptions()}
            loading={loading}
          />
        </View>
      </BottomSheet>
    </>
  );
}
