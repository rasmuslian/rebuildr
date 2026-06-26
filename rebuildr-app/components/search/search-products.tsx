import {
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
import InteractiveMap from "@components/maps/interactive-map";
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
};

type Props = {
  title?: string;
  showDistance?: boolean;
};

type ProductCardSource = {
  id: string;
  title: string;
  status: ProductStatusEnum;
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
    rating: number;
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

export default function SearchProducts({ title, showDistance = false }: Props) {
  const PAGE_SIZE = 10;
  const [state, setState] = useReducerState<StateType>(initialState);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { isLoggedIn } = useUser();
  const { userCoords } = useLocationContext();
  const { filter, nrOfAppliedFilters, toProductsQueryInput } =
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

  const { data, loading, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    skip: !state.transportationHydrated,
    variables: {
      input: {
        ...toProductsQueryInput(),
        distance: state.transportationOptions.pickup
          ? state.transportationOptions.distance
          : undefined,
        location: state.transportationOptions.pickup
          ? transportationLocation
          : undefined,
        pickup: state.transportationOptions.pickup,
        shipping: state.transportationOptions.shipping,
        delivery: state.transportationOptions.delivery,
      },
      limit: PAGE_SIZE,
      offset: 0,
      distanceFrom: showDistance ? userLocation : undefined,
      isLoggedIn,
    },
  });

  const exactProducts = data?.products.products ?? [];
  const exactProductIds = exactProducts.map((product) => product.id);
  const exactResultsLoaded =
    !!filter.searchString &&
    !!data &&
    !loading &&
    exactProducts.length >= data.products.total;
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
        distanceFrom: showDistance ? userLocation : undefined,
        isLoggedIn,
      },
    },
  );

  const relatedProducts = relatedData?.relatedProducts.products ?? [];
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
    heart: product.seller.id !== viewerId,
    liked: !!product.likedByMe,
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
                products={exactProducts.map((product) =>
                  mapProductToAd(product, data?.me?.id),
                )}
                pagination={{
                  onShowMore,
                  total: data?.products.total ?? 0,
                  loading,
                }}
              />
              <RelatedProductsSection />
            </View>

            <InteractiveMap
              style={{
                position: "sticky",
                top: SCREEN_TOP_MARGIN,
                flex: 1,
                height: screenHeight - 72 - 48,
                borderRadius: borderRadius.medium,
              }}
              productsInput={{
                ...toProductsQueryInput(),
                distance: state.transportationOptions.pickup
                  ? state.transportationOptions.distance
                  : undefined,
                location: state.transportationOptions.pickup
                  ? transportationLocation
                  : undefined,
                pickup: state.transportationOptions.pickup,
                shipping: state.transportationOptions.shipping,
                delivery: state.transportationOptions.delivery,
              }}
            />
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
            products={exactProducts.map((product) =>
              mapProductToAd(product, data?.me?.id),
            )}
            pagination={{
              onShowMore,
              total: data?.products.total ?? 0,
              loading,
            }}
          />
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
