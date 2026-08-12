import {
  OrderProductsEnum,
  ProductAvailabilityEnum,
  ProductsInput,
  ProductStatusEnum,
  ProductConditionEnum,
  SearchProductsQuery,
  SearchProductsQueryVariables,
  UserType,
} from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { SCREEN_TOP_MARGIN } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import { FilterBottomSheet } from "@components/filter-product/filter-bottom-sheet";
import {
  defaultTransportationFilterOptions,
  getTransportationLabel,
  PersistedTransportationFilterOptions,
  TransportationOptions,
} from "@components/search/transportation-options";
import { MapCanvas } from "@components/maps/interactive-map";
import { Bounds, MapProvider, useMapContext } from "@context/map-context";
import { Check } from "@components/controls/check";
import {
  RELATED_SEARCH_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "@/queries";
import { useReducerState } from "@hooks/useReducerState";
import { useUser } from "@hooks/useUser";
import { borderRadius } from "@constants/sizes";
import { defaultRadius } from "@constants/map";
import MapThumbnail from "@components/maps/map-thumbnail";
import { useLocationContext } from "@context/location-context";
import RebuildrHead from "@components/meta-data/rebuildr-head";
import { getItem, setItem } from "@/utils/async-storage";
import { dividerStyles } from "@components/dividers/divider";
import { useThemeColor } from "@hooks/useThemeColor";

type StateType = {
  showFilter: boolean;
  transportationLabel: string;
  showTransportSheet: boolean;
  transportationHydrated: boolean;
  transportationOptions: PersistedTransportationFilterOptions;
  // "Nära mig" was pressed; frame the map once the distance-sorted list loads.
  pendingNearMe: boolean;
};

const TRANSPORTATION_FILTER_STORAGE_KEY = "search-transportation-filter";
const RELATED_PAGE_SIZE = 30;

const initialState: StateType = {
  showFilter: false,
  transportationLabel: getTransportationLabel(
    defaultTransportationFilterOptions,
  ),
  showTransportSheet: false,
  transportationHydrated: false,
  transportationOptions: defaultTransportationFilterOptions,
  pendingNearMe: false,
};

type Props = {
  title?: string;
  showDistance?: boolean;
};

type ProductCardSource = {
  id: string;
  title: string;
  status: ProductStatusEnum;
  availability: ProductAvailabilityEnum;
  price: number;
  soldByQuantity: boolean;
  condition: ProductConditionEnum;
  primaryQuantity?: number | null;
  distanceFromLocation?: number | null;
  likedByMe?: boolean | null;
  primaryImage?: { url: string } | null;
  approximatePlace?: { address: string } | null;
  seller: {
    id: string;
    type: UserType;
    rating: number | null | undefined;
  };
};

type RelatedSearchProductsQuery = {
  relatedProducts: {
    products: ProductCardSource[];
    total: number;
  };
  me?: { id: string } | null;
};

type RelatedSearchProductsQueryVariables = {
  input: ProductsInput;
  excludeProductIds?: string[];
  limit?: number;
  offset?: number;
  isLoggedIn: boolean;
  distanceFrom?: { lat: number; lng: number };
};

const boundsMatch = (a?: Bounds, b?: Bounds) => {
  if (!a || !b) return false;
  return (
    a.northEast.lat === b.northEast.lat &&
    a.northEast.lng === b.northEast.lng &&
    a.southWest.lat === b.southWest.lat &&
    a.southWest.lng === b.southWest.lng
  );
};

function SearchProductsContent({ title, showDistance = false }: Props) {
  const PAGE_SIZE = 10;
  const [state, setState] = useReducerState<StateType>(initialState);
  const { state: mapState, setState: setMapState } = useMapContext();
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { isLoggedIn } = useUser();
  const { userCoords } = useLocationContext();
  const { filter, filterBuilder, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();

  const { onToggleProductHeart } = useLikeProduct();
  const { height: screenHeight } = useWindowDimensions();

  const userLocation = userCoords && {
    lat: userCoords.latitude,
    lng: userCoords.longitude,
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateTransportationOptions = async () => {
      const storedOptions = normalizeTransportationOptions(
        await getItem(TRANSPORTATION_FILTER_STORAGE_KEY),
      );

      if (cancelled) {
        return;
      }

      const nextOptions = storedOptions ?? defaultTransportationFilterOptions;

      setState({
        transportationHydrated: true,
        transportationLabel: getTransportationLabel(nextOptions),
        transportationOptions: nextOptions,
      });
    };

    hydrateTransportationOptions().catch(() => {
      if (cancelled) {
        return;
      }

      setState({
        transportationHydrated: true,
        transportationLabel: getTransportationLabel(
          defaultTransportationFilterOptions,
        ),
        transportationOptions: defaultTransportationFilterOptions,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const transportationLocation =
    state.transportationOptions.location ?? userLocation;

  const sortByDistance = filter.sorting === OrderProductsEnum.Distance;
  const areaSearch = !!mapState.searchArea;

  // The pickup radius means "delivery near me", so only apply it once the user
  // has actually opted into a position (chose "Använd min plats" or a point).
  // Otherwise the default would hide everything for anyone not near a product.
  // It also never limits the map pins and is dropped during an area search,
  // since the viewport/bounding box already handles geography there.
  const hasProximityIntent =
    state.transportationOptions.useMyLocation ||
    !!state.transportationOptions.location;
  const applyPickupRadius =
    state.transportationOptions.pickup && hasProximityIntent && !areaSearch;

  // Origin point for the radius filter and the distance sort ("Nära mig").
  const originLocation = applyPickupRadius
    ? transportationLocation
    : sortByDistance
      ? userLocation
      : undefined;

  // Filters shared by the list and the map pins (delivery methods, category,
  // text…). The map viewport / bounding box handles geography separately.
  const commonProductsInput: ProductsInput = {
    ...toProductsQueryInput(),
    pickup: state.transportationOptions.pickup,
    shipping: state.transportationOptions.shipping,
    delivery: state.transportationOptions.delivery,
  };

  // Pins are already limited to the visible map area, so never radius-filter
  // them around the user (that would hide everything when browsing elsewhere).
  const pinsProductsInput = commonProductsInput;

  const listProductsInput: ProductsInput = {
    ...commonProductsInput,
    distance: applyPickupRadius
      ? state.transportationOptions.distance
      : undefined,
    location: originLocation,
    boundingBox: mapState.searchArea
      ? {
          northEast: {
            lat: mapState.searchArea.northEast.lat,
            lng: mapState.searchArea.northEast.lng,
          },
          southWest: {
            lat: mapState.searchArea.southWest.lat,
            lng: mapState.searchArea.southWest.lng,
          },
        }
      : undefined,
  };

  // Sort the list by distance; the map is framed on the user + their nearest
  // hit once the reloaded list arrives (see the effect below).
  const onPressNearMe = () => {
    filterBuilder.setOrdering(OrderProductsEnum.Distance).apply();
    setState({ pendingNearMe: true });
  };

  // Feed the filter to the map provider so pins match the list.
  useEffect(() => {
    setMapState({ productsInput: pinsProductsInput });
  }, [JSON.stringify(pinsProductsInput)]);

  const { data, loading, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    skip: !state.transportationHydrated,
    variables: {
      input: listProductsInput,
      limit: PAGE_SIZE,
      offset: 0,
      distanceFrom: userLocation,
      isLoggedIn,
    },
  });

  // After "Nära mig" re-sorts and the list reloads, frame the map on the user
  // plus a radius reaching their nearest hit — so far-away results stay visible
  // instead of centering on an empty spot. Falls back to centering when empty.
  useEffect(() => {
    if (!state.pendingNearMe || !sortByDistance || loading) {
      return;
    }
    // Only frame the map when we have the user's position; either way clear
    // the pending flag once the list has settled so it can't re-fire later.
    if (userLocation) {
      const nearestMeters = data?.products.products[0]?.distanceFromLocation;
      if (nearestMeters && nearestMeters > 0) {
        const meters = nearestMeters * 1.3 + 500;
        const latDelta = meters / 111320;
        const lngDelta =
          meters / (111320 * Math.cos((userLocation.lat * Math.PI) / 180));
        setMapState({
          fitBounds: {
            northEast: {
              lat: userLocation.lat + latDelta,
              lng: userLocation.lng + lngDelta,
            },
            southWest: {
              lat: userLocation.lat - latDelta,
              lng: userLocation.lng - lngDelta,
            },
          },
        });
      } else {
        setMapState({ center: [userLocation.lat - 0.008, userLocation.lng] });
      }
    }
    setState({ pendingNearMe: false });
  }, [state.pendingNearMe, sortByDistance, loading, data, userLocation]);

  const exactProducts = data?.products.products ?? [];
  const exactProductIds = exactProducts.map((product) => product.id);
  const allExactResultsLoaded =
    !!data && !loading && exactProducts.length >= data.products.total;
  // Offer "similar ads" both for text searches and for area-limited searches
  // (so a bounded search that returns little still has a fallback).
  const exactResultsLoaded =
    allExactResultsLoaded && (!!filter.searchString || !!mapState.searchArea);
  const relatedProductsInput: ProductsInput = {
    ...toProductsQueryInput(),
    distance: undefined,
    location: undefined,
    pickup: undefined,
    shipping: undefined,
    delivery: undefined,
  };
  const {
    data: relatedData,
    loading: relatedLoading,
    fetchMore: fetchMoreRelated,
  } = useQuery<RelatedSearchProductsQuery, RelatedSearchProductsQueryVariables>(
    RELATED_SEARCH_PRODUCTS_QUERY,
    {
      skip: !state.transportationHydrated || !exactResultsLoaded,
      variables: {
        input: relatedProductsInput,
        excludeProductIds: exactProductIds,
        limit: RELATED_PAGE_SIZE,
        offset: 0,
        distanceFrom: userLocation,
        isLoggedIn,
      },
    },
  );

  const relatedProducts = relatedData?.relatedProducts.products ?? [];

  // Show "search this area" once the viewport has drifted from the applied
  // search area (and the user isn't already auto-searching on move).
  const showSearchHereButton =
    !mapState.searchOnMove &&
    !!mapState.bounds &&
    !boundsMatch(mapState.bounds, mapState.searchArea);

  const showEmptyState =
    state.transportationHydrated &&
    !loading &&
    (data?.products.total ?? 0) === 0;

  const emptyState = (
    <View style={{ gap: 16, alignItems: "flex-start" }}>
      <View style={{ gap: 4 }}>
        <Headline size="small">
          {mapState.searchArea
            ? "Inga annonser i det här området"
            : "Inga annonser matchar din sökning"}
        </Headline>
        <Body size="medium" color="secondary">
          {mapState.searchArea
            ? "Prova att zooma ut på kartan eller sök i hela Sverige."
            : "Prova att ändra dina filter eller söka bredare."}
        </Body>
      </View>
      {mapState.searchArea && (
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Button
            label="Zooma ut"
            type="tonal"
            onPress={() =>
              setMapState({
                zoomOutSignal: mapState.zoomOutSignal + 1,
                searchArea: undefined,
              })
            }
          />
          <Button
            label="Sök i hela Sverige"
            onPress={() => {
              setMapState({
                searchArea: undefined,
                // Frame the whole country (clamped by the map's minZoom).
                fitBounds: {
                  northEast: { lat: 69.1, lng: 24.2 },
                  southWest: { lat: 55.3, lng: 11.0 },
                },
              });
              filterBuilder.setOrdering(OrderProductsEnum.BestMatch).apply();
            }}
          />
        </View>
      )}
    </View>
  );

  const mapProductToAd = (product: ProductCardSource, viewerId?: string) => ({
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
    soldByQuantity: product.soldByQuantity,
    status: product.status,
    upcoming: product.availability === ProductAvailabilityEnum.Upcoming,
    heart: product.seller.id !== viewerId,
    liked: !!product.likedByMe,
    highlighted: mapState.selectedProductId === product.id,
    onHoverIn: () => setMapState({ hoveredProductId: product.id }),
    onHoverOut: () => setMapState({ hoveredProductId: undefined }),
    onHeartPress: () => {
      onToggleProductHeart({
        productId: product.id,
        likedByMe: !!product.likedByMe,
      });
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

  const onShowMoreRelated = async () => {
    await fetchMoreRelated({
      variables: {
        offset: Math.ceil(relatedProducts.length / RELATED_PAGE_SIZE),
        limit: RELATED_PAGE_SIZE,
        excludeProductIds: exactProductIds,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.relatedProducts?.products.length) return prev;

        return {
          ...prev,
          relatedProducts: {
            ...prev.relatedProducts,
            ...fetchMoreResult.relatedProducts,
            products: [
              ...prev.relatedProducts.products,
              ...fetchMoreResult.relatedProducts.products,
            ],
          },
        };
      },
    });
  };

  const RelatedProductsSection = () => {
    if (!exactResultsLoaded || (!relatedLoading && !relatedProducts.length)) {
      return null;
    }

    return (
      <View
        style={[
          dividerStyles(colors).topDivider,
          { gap: 16, marginTop: 32, paddingTop: 32 },
        ]}
      >
        <View style={{ gap: 4 }}>
          <Headline size="small">
            Liknande annonser utanför din sökning
          </Headline>
          <Body size="medium" color="secondary">
            De här annonserna kan ligga utanför dina filter eller vara bredare
            matchningar.
          </Body>
        </View>
        <AdGridSection
          desktopColumnNumber={isDesktop ? 2 : undefined}
          products={relatedProducts.map((product) =>
            mapProductToAd(product, relatedData?.me?.id ?? data?.me?.id),
          )}
          pagination={{
            onShowMore: onShowMoreRelated,
            total: relatedData?.relatedProducts.total ?? 0,
            loading: relatedLoading,
          }}
        />
      </View>
    );
  };

  const onApplyTranportationOptions = async (
    options: PersistedTransportationFilterOptions,
  ) => {
    setState({
      showTransportSheet: false,
      transportationLabel: getTransportationLabel(options),
      transportationOptions: options,
    });

    await setItem(TRANSPORTATION_FILTER_STORAGE_KEY, options);
  };

  return (
    <>
      <RebuildrHead
        title={title ?? "Sök produkter"}
        description={`${title ?? "Sök produkter"} – bläddra och sök bland återbrukat byggmaterial på RebuildR.`}
      />

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

              {title && (
                <View style={{ marginBottom: 24 }}>
                  <Display size="small" heading={1}>
                    {title}
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
                  label="Nära mig"
                  icon="navigation"
                  onPress={onPressNearMe}
                  type={sortByDistance ? "filled" : "tonal"}
                />
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

              {showEmptyState ? (
                emptyState
              ) : (
                <AdGridSection
                  desktopColumnNumber={2}
                  products={exactProducts.map((product) =>
                    mapProductToAd(product, data?.me?.id),
                  )}
                  pagination={{
                    onShowMore,
                    total: data?.products.total ?? 0,
                    loading,
                  }}
                />
              )}
              <RelatedProductsSection />
            </View>

            <View
              style={{
                position: "sticky" as "absolute",
                top: SCREEN_TOP_MARGIN,
                flex: 1,
                height: screenHeight - 72 - 48,
              }}
            >
              <MapCanvas
                style={{
                  height: "100%",
                  borderRadius: borderRadius.medium,
                }}
              />

              {showSearchHereButton && (
                <View
                  pointerEvents="box-none"
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <Button
                    label="Sök i det här området"
                    onPress={() => setMapState({ searchArea: mapState.bounds })}
                  />
                </View>
              )}

              <View
                pointerEvents="box-none"
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  zIndex: 1000,
                }}
              >
                <Pressable
                  onPress={() =>
                    setMapState({ searchOnMove: !mapState.searchOnMove })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "white",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                  }}
                >
                  {/* Presentational and click-through: Check is a Pressable of
                      its own, so it would swallow presses on the box itself.
                      The outer Pressable owns the toggle for the whole row. */}
                  <View pointerEvents="none">
                    <Check selected={mapState.searchOnMove} />
                  </View>
                  <Body size="small">Sök när jag flyttar kartan</Body>
                </Pressable>
              </View>
            </View>
          </View>

          <SlideInSheet
            open={state.showTransportSheet}
            onClose={() =>
              setState({
                showTransportSheet: false,
                transportationLabel: getTransportationLabel(
                  state.transportationOptions,
                ),
              })
            }
            title="Leveransalternativ"
            contentWaitOnAnimation
          >
            <TransportationOptions
              key={`desktop-${state.showTransportSheet}-${JSON.stringify(
                state.transportationOptions,
              )}`}
              data={data}
              loading={loading}
              initialOptions={{
                ...state.transportationOptions,
                distance: state.transportationOptions.distance ?? defaultRadius,
                location: transportationLocation,
              }}
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

          {title && (
            <View style={{ marginBottom: 24 }}>
              <Display size="small" heading={1}>
                {title}
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

          <View style={{ gap: 12, marginBottom: 16 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Body size="medium" style={{ flex: 1 }} color="secondary">
                {data?.products.total ?? 0}{" "}
                {data?.products.total === 1 ? "träff" : "träffar"}:
              </Body>
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
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                label="Nära mig"
                icon="navigation"
                onPress={onPressNearMe}
                type={sortByDistance ? "filled" : "tonal"}
              />
              <Button
                label={state.transportationLabel}
                onPress={() => setState({ showTransportSheet: true })}
                type="tonal"
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {showEmptyState ? (
            emptyState
          ) : (
            <AdGridSection
              products={exactProducts.map((product) =>
                mapProductToAd(product, data?.me?.id),
              )}
              pagination={{
                onShowMore,
                total: data?.products.total ?? 0,
                loading,
              }}
            />
          )}
          <RelatedProductsSection />

          <FilterBottomSheet
            open={state.showFilter}
            onClose={() => setState({ showFilter: false })}
          />

          <BottomSheet
            open={state.showTransportSheet}
            onDismiss={() =>
              setState({
                showTransportSheet: false,
                transportationLabel: getTransportationLabel(
                  state.transportationOptions,
                ),
              })
            }
            name="delivery"
            title="Leveransalternativ"
            scrollable
          >
            <TransportationOptions
              key={`mobile-${state.showTransportSheet}-${JSON.stringify(
                state.transportationOptions,
              )}`}
              data={data}
              loading={loading}
              initialOptions={{
                ...state.transportationOptions,
                distance: state.transportationOptions.distance ?? defaultRadius,
                location: transportationLocation,
              }}
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

export default function SearchProducts(props: Props) {
  return (
    <MapProvider>
      <SearchProductsContent {...props} />
    </MapProvider>
  );
}

const normalizeTransportationOptions = (
  value: unknown,
): PersistedTransportationFilterOptions | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const options = value as Partial<PersistedTransportationFilterOptions>;
  const location = options.location as
    | { lat?: number; lng?: number }
    | undefined;

  return {
    pickup:
      typeof options.pickup === "boolean"
        ? options.pickup
        : defaultTransportationFilterOptions.pickup,
    shipping:
      typeof options.shipping === "boolean"
        ? options.shipping
        : defaultTransportationFilterOptions.shipping,
    delivery:
      typeof options.delivery === "boolean"
        ? options.delivery
        : defaultTransportationFilterOptions.delivery,
    distance:
      typeof options.distance === "number"
        ? options.distance
        : defaultTransportationFilterOptions.distance,
    location:
      typeof location?.lat === "number" && typeof location?.lng === "number"
        ? { lat: location.lat, lng: location.lng }
        : undefined,
    useMyLocation:
      typeof options.useMyLocation === "boolean"
        ? options.useMyLocation
        : defaultTransportationFilterOptions.useMyLocation,
  };
};
