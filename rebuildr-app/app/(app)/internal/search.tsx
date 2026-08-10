import {
  InternalAdsPageQuery,
  InternalAdsPageQueryVariables,
  ProductStatusEnum,
  RelatedInternalAdsQuery,
  RelatedInternalAdsQueryVariables,
} from "@/gql/graphql";
import {
  INTERNAL_ADS_PAGE_QUERY,
  RELATED_INTERNAL_ADS,
} from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Badge } from "@components/badges/badge";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { FilterBottomSheet } from "@components/filter-product/filter-bottom-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import InteractiveMap from "@components/maps/interactive-map";
import MapThumbnail from "@components/maps/map-thumbnail";
import TopBar from "@components/navigation/top-bar/top-bar";
import {
  SCREEN_TOP_MARGIN,
  ScreenLayout,
} from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import {
  defaultTransportationFilterOptions,
  getTransportationLabel,
  PersistedTransportationFilterOptions,
  TransportationOptions,
} from "@components/search/transportation-options";
import { Body, Display, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { FilterProductScopeProvider } from "@context/filter-product-scope-context";
import { useLocationContext } from "@context/location-context";
import { useSearchContext } from "@context/search-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

const PAGE_SIZE = 20;

export default function InternalSearchPage() {
  return (
    <FilterProductScopeProvider scope="internal">
      <InternalSearchResults />
    </FilterProductScopeProvider>
  );
}

const InternalSearchResults = () => {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = q ?? "";
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { height: screenHeight } = useWindowDimensions();
  const { userCoords } = useLocationContext();
  const searchContext = useSearchContext();
  const { filterBuilder, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();
  const [showFilter, setShowFilter] = useState(false);
  const [showTransportSheet, setShowTransportSheet] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [transportationOptions, setTransportationOptions] = useState(
    defaultTransportationFilterOptions,
  );
  const [transportationLabel, setTransportationLabel] = useState(
    getTransportationLabel(defaultTransportationFilterOptions),
  );

  useEffect(() => {
    filterBuilder.setSearchString(query).apply();
    searchContext.setSearchState({
      searchString: query,
      completedSearchString: query,
      searchScope: "internal",
      dropdownVisible: false,
    });
  }, [query, searchContext.setSearchState]);

  const transportationLocation =
    transportationOptions.location ??
    (userCoords
      ? { lat: userCoords.latitude, lng: userCoords.longitude }
      : undefined);
  const input = {
    ...toProductsQueryInput(),
    searchString: query,
    distance: transportationOptions.pickup
      ? transportationOptions.distance
      : undefined,
    location: transportationOptions.pickup ? transportationLocation : undefined,
    pickup: transportationOptions.pickup,
    shipping: transportationOptions.shipping,
    delivery: transportationOptions.delivery,
  };
  const { data, loading, fetchMore } = useQuery<
    InternalAdsPageQuery,
    InternalAdsPageQueryVariables
  >(INTERNAL_ADS_PAGE_QUERY, {
    variables: { input, limit: PAGE_SIZE, offset: 0 },
    fetchPolicy: "cache-and-network",
  });
  const exactProducts = data?.internalAds.products ?? [];
  const exactResultsLoaded =
    !!data && !loading && exactProducts.length >= data.internalAds.total;
  const {
    data: relatedData,
    loading: relatedLoading,
    fetchMore: fetchMoreRelated,
  } = useQuery<RelatedInternalAdsQuery, RelatedInternalAdsQueryVariables>(
    RELATED_INTERNAL_ADS,
    {
      skip: !exactResultsLoaded,
      variables: {
        input,
        excludeProductIds: exactProducts.map((product) => product.id),
        limit: PAGE_SIZE,
        offset: 0,
      },
    },
  );
  const relatedProducts = relatedData?.relatedInternalAds.products ?? [];

  const mapProduct = (
    product: InternalAdsPageQuery["internalAds"]["products"][number],
  ) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    condition: product.condition,
    imageUri: product.primaryImage?.url,
    quantity: product.primaryQuantity,
    quantityUnit: product.primaryUnit,
    soldByQuantity: product.soldByQuantity,
    status: product.status,
    overlayText: product.status === ProductStatusEnum.Sold ? "Såld" : undefined,
    onPress: () =>
      router.navigate({
        pathname: "/internal/[productId]",
        params: { productId: product.id },
      }),
  });

  const onApplyTransportation = (
    options: PersistedTransportationFilterOptions,
  ) => {
    setTransportationOptions(options);
    setTransportationLabel(getTransportationLabel(options));
    setShowTransportSheet(false);
  };

  const results = (
    <>
      <View
        style={{
          alignItems: isDesktop ? "flex-start" : "center",
          flexDirection: "row",
          justifyContent: isDesktop ? "flex-start" : "center",
          marginBottom: 24,
        }}
      >
        <Display size="small">“</Display>
        <Display size="small" numberOfLines={1} ellipsizeMode="tail">
          {query}
        </Display>
        <Display size="small">“</Display>
      </View>

      {!isDesktop && (
        <Pressable onPress={() => setShowMobileMap((visible) => !visible)}>
          {showMobileMap ? (
            <InteractiveMap
              searchScope="internal"
              productsInput={input}
              initialCenter={transportationLocation}
              style={{ height: 320, marginBottom: 16 }}
            />
          ) : (
            <MapThumbnail
              coords={
                transportationLocation
                  ? [transportationLocation.lat, transportationLocation.lng]
                  : undefined
              }
              style={{ marginBottom: 16 }}
              cta={
                <Button
                  label="Visa på karta"
                  type="text"
                  icon="map"
                  style={{ backgroundColor: "white" }}
                  onPress={() => setShowMobileMap(true)}
                />
              }
            />
          )}
        </Pressable>
      )}

      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 8,
          marginBottom: isDesktop ? 32 : 16,
        }}
      >
        <Body size="medium" style={{ flex: 1 }} color="secondary">
          {data?.internalAds.total ?? 0}{" "}
          {data?.internalAds.total === 1 ? "träff" : "träffar"}:
        </Body>
        <Button
          label={transportationLabel}
          onPress={() => setShowTransportSheet(true)}
          type="tonal"
        />
        <View>
          <Button
            icon="filterList2"
            type="tonal"
            onPress={() => setShowFilter(true)}
          />
          {!!nrOfAppliedFilters() && (
            <View style={{ position: "absolute", right: 1, top: 1 }}>
              <Badge text={`${nrOfAppliedFilters()}`} />
            </View>
          )}
        </View>
      </View>

      <AdGridSection
        desktopColumnNumber={isDesktop ? 2 : undefined}
        products={exactProducts.map(mapProduct)}
        pagination={{
          total: data?.internalAds.total ?? 0,
          loading,
          onShowMore: () =>
            fetchMore({
              variables: {
                offset: Math.ceil(exactProducts.length / PAGE_SIZE),
                limit: PAGE_SIZE,
              },
              updateQuery: (previous, { fetchMoreResult }) => ({
                ...previous,
                internalAds: {
                  ...fetchMoreResult.internalAds,
                  products: [
                    ...previous.internalAds.products,
                    ...fetchMoreResult.internalAds.products,
                  ],
                },
              }),
            }),
        }}
      />

      {exactResultsLoaded && (relatedLoading || relatedProducts.length > 0) && (
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
            products={relatedProducts.map(mapProduct)}
            pagination={{
              total: relatedData?.relatedInternalAds.total ?? 0,
              loading: relatedLoading,
              onShowMore: () =>
                fetchMoreRelated({
                  variables: {
                    offset: Math.ceil(relatedProducts.length / PAGE_SIZE),
                    limit: PAGE_SIZE,
                    excludeProductIds: exactProducts.map(
                      (product) => product.id,
                    ),
                  },
                  updateQuery: (previous, { fetchMoreResult }) => ({
                    ...previous,
                    relatedInternalAds: {
                      ...fetchMoreResult.relatedInternalAds,
                      products: [
                        ...previous.relatedInternalAds.products,
                        ...fetchMoreResult.relatedInternalAds.products,
                      ],
                    },
                  }),
                }),
            }}
          />
        </View>
      )}
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {isDesktop && <TopBar theme="light" searchScope="internal" />}
      <ScreenLayout
        headerComponent={
          !isDesktop ? (
            <SearchBar
              onPressArrow={() => router.back()}
              placeholder="Sök i internlagret"
              searchScope="internal"
              searchOnSubmit
            />
          ) : undefined
        }
      >
        {isDesktop ? (
          <View style={{ flexDirection: "row", gap: 48 }}>
            <View style={{ flex: 1 }}>{results}</View>
            <InteractiveMap
              searchScope="internal"
              productsInput={input}
              initialCenter={transportationLocation}
              style={{
                borderRadius: borderRadius.medium,
                flex: 1,
                height: screenHeight - 72 - 48,
                position: "sticky",
                top: SCREEN_TOP_MARGIN,
              }}
            />
          </View>
        ) : (
          results
        )}
      </ScreenLayout>

      {isDesktop ? (
        <>
          <FilterSlideSheet
            open={showFilter}
            onClose={() => setShowFilter(false)}
          />
          <SlideInSheet
            open={showTransportSheet}
            onClose={() => setShowTransportSheet(false)}
            title="Leveransalternativ"
            contentWaitOnAnimation
          >
            <TransportationOptions
              initialOptions={{
                ...transportationOptions,
                location: transportationLocation,
              }}
              loading={loading}
              setTransportationLabel={setTransportationLabel}
              onApply={onApplyTransportation}
            />
          </SlideInSheet>
        </>
      ) : (
        <>
          <FilterBottomSheet
            open={showFilter}
            onClose={() => setShowFilter(false)}
          />
          <BottomSheet
            open={showTransportSheet}
            onDismiss={() => setShowTransportSheet(false)}
            name="internalDelivery"
            title="Leveransalternativ"
            scrollable
          >
            <TransportationOptions
              initialOptions={{
                ...transportationOptions,
                location: transportationLocation,
              }}
              loading={loading}
              setTransportationLabel={setTransportationLabel}
              onApply={onApplyTransportation}
            />
          </BottomSheet>
        </>
      )}
    </View>
  );
};
