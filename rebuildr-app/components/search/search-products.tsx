import {
  SearchProductsQuery,
  SearchProductsQueryVariables,
} from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { SCREEN_TOP_MARGIN } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import {
  TransportationFilterOptions,
  TransportationOptions,
} from "@components/search/transportation-options";
import InteractiveMap from "@components/maps/interactive-map";
import { SEARCH_PRODUCTS_QUERY } from "@/queries";
import { useReducerState } from "@hooks/useReducerState";
import { useUser } from "@hooks/useUser";
import { borderRadius } from "@constants/sizes";
import MapThumbnail from "@components/maps/map-thumbnail";
import { useLocationContext } from "@context/location-context";
import { permanentSection } from "@constants/permanent-sections";
import RebuildrHead from "@components/meta-data/rebuildr-head";

type StateType = {
  showFilter: boolean;
  transportationLabel: string;
  showTransportSheet: boolean;
};

const initialState: StateType = {
  showFilter: false,
  transportationLabel: "Alla leveranssätt",
  showTransportSheet: false,
};

export default function SearchProducts() {
  const PAGE_SIZE = 10;
  const [state, setState] = useReducerState<StateType>(initialState);
  const { isDesktop } = useScreenType();
  const { isLoggedIn } = useUser();
  const { userCoords } = useLocationContext();
  const { filter, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();

  const { onToggleProductHeart } = useLikeProduct();
  const { height: screenHeight } = useWindowDimensions();
  const MAP_HEIGHT = screenHeight - 72 - 48;

  const userLocation = userCoords && {
    lat: userCoords.latitude,
    lng: userCoords.longitude,
  };

  const { data, loading, refetch, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    variables: {
      input: {
        ...toProductsQueryInput(),
        location: userLocation,
      },
      limit: PAGE_SIZE,
      offset: 0,
      distanceFrom:
        filter.sourceSection === "nearYou"
          ? (userLocation ?? undefined)
          : undefined,
      isLoggedIn,
    },
  });

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        offset: Math.ceil((data?.products?.products.length ?? 0) / PAGE_SIZE),
        limit: PAGE_SIZE,
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

  const onApplyTranportationOptions = async (
    options: TransportationFilterOptions,
  ) => {
    await refetch({
      input: {
        searchString: filter.searchString,
        orderBy: filter.sorting,
        categoryIds: filter.categoryIds,
        brandIds: filter.brandIds,
        conditions: filter.conditions,
        minPrice: filter.price?.[0],
        maxPrice: filter.price?.[1],
        giveaway: filter.giveaway,
        ...options,
      },
    });
    setState({ showTransportSheet: false });
  };

  useEffect(() => {
    refetch();
  }, [filter.categoryIds]);

  return (
    <>
      <RebuildrHead title="Sök produkter" />

      {isDesktop ? (
        <>
          <View style={{ flexDirection: "row", gap: 48 }}>
            <View style={{ flex: 1 }}>
              {!!filter.searchString && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginBottom: 24,
                  }}
                >
                  <Display size="small">“</Display>
                  <Display size="small" numberOfLines={1} ellipsizeMode="tail">
                    {filter.searchString}
                  </Display>
                  <Display size="small">“</Display>
                </View>
              )}

              {!!filter.sourceSection && (
                <View
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <Display size="small">
                    {permanentSection[filter.sourceSection].title}
                  </Display>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 32,
                }}
              >
                <Body size="medium" style={{ flex: 1 }} color="secondary">
                  {data?.products.total ?? 0}{" "}
                  {data?.products.total === 1 ? "träff" : "träffar"}:
                </Body>
                <Button
                  label={state.transportationLabel}
                  onPress={() => setState({ showTransportSheet: true })}
                  type="tonal"
                />
                <View>
                  <Button
                    icon="filterList2"
                    type="tonal"
                    onPress={() => setState({ showFilter: true })}
                  />
                  {!!nrOfAppliedFilters() && (
                    <View style={{ position: "absolute", right: 1, top: 1 }}>
                      <Badge text={`${nrOfAppliedFilters()}`} />
                    </View>
                  )}
                </View>
              </View>

              <AdGridSection
                desktopColumnNumber={2}
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
                    distance: product.distanceFromLocation,
                    price: product.price,
                    status: product.status,
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
                pagination={{
                  onShowMore,
                  total: data?.products.total ?? 0,
                  loading,
                }}
              />
            </View>

            <InteractiveMap
              style={{
                position: "sticky",
                top: SCREEN_TOP_MARGIN,
                flex: 1,
                height: MAP_HEIGHT,
                borderRadius: borderRadius.medium,
              }}
              productsInput={toProductsQueryInput()}
            />
          </View>

          <SlideInSheet
            open={state.showTransportSheet}
            onClose={() => setState({ showTransportSheet: false })}
            title="Leveransalternativ"
            contentWaitOnAnimation
          >
            <TransportationOptions
              data={data}
              loading={loading}
              setTransportationLabel={(label) =>
                setState({ transportationLabel: label })
              }
              onApply={onApplyTranportationOptions}
            />
          </SlideInSheet>

          <FilterSlideSheet
            open={state.showFilter}
            onClose={() => setState({ showFilter: false })}
          />
        </>
      ) : (
        <>
          {!!filter.searchString && (
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
                {filter.searchString}
              </Display>
              <Display size="small">“</Display>
            </View>
          )}

          {!!filter.sourceSection && (
            <View
              style={{
                marginBottom: 24,
              }}
            >
              <Display size="small">
                {permanentSection[filter.sourceSection].title}
              </Display>
            </View>
          )}

          <Pressable onPress={() => router.navigate("/map")}>
            <MapThumbnail
              coords={
                userCoords
                  ? [userCoords.latitude, userCoords.longitude]
                  : undefined
              }
              style={{ marginBottom: 16 }}
              cta={
                <Button
                  label="Visa på karta"
                  type="text"
                  icon="map"
                  style={{ backgroundColor: "white" }}
                  onPress={() => router.navigate("/map")}
                />
              }
            />
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Body size="medium" style={{ flex: 1 }} color="secondary">
              {data?.products.total ?? 0}{" "}
              {data?.products.total === 1 ? "träff" : "träffar"}:
            </Body>
            <Button
              label={state.transportationLabel}
              onPress={() => setState({ showTransportSheet: true })}
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
                status: product.status,
                heart: product.seller.id !== data.me?.id,
                liked: !!product.likedByMe,
                onHeartPress: () => {
                  onToggleProductHeart({
                    productId: product.id,
                    likedByMe: !!product.likedByMe,
                  });
                },
                distance: product.distanceFromLocation,
              })) ?? []
            }
            pagination={{
              onShowMore,
              total: data?.products.total ?? 0,
              loading,
            }}
          />

          <BottomSheet
            open={state.showTransportSheet}
            onDismiss={() => setState({ showTransportSheet: false })}
            name="delivery"
            title="Leveransalternativ"
            scrollable
          >
            <TransportationOptions
              data={data}
              loading={loading}
              setTransportationLabel={(label) =>
                setState({ transportationLabel: label })
              }
              onApply={onApplyTranportationOptions}
            />
          </BottomSheet>
        </>
      )}
    </>
  );
}
