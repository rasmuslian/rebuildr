import {
  InternalAdsPageQuery,
  InternalAdsPageQueryVariables,
  ProductAvailabilityEnum,
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
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { FilterBottomSheet } from "@components/filter-product/filter-bottom-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import InteractiveMap from "@components/maps/interactive-map";
import MapThumbnail from "@components/maps/map-thumbnail";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import {
  SCREEN_TOP_MARGIN,
  ScreenLayout,
} from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { Body, Display, Headline } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { isWeb } from "@constants/layout";
import { borderRadius } from "@constants/sizes";
import { FilterProductScopeProvider } from "@context/filter-product-scope-context";
import { useSearchContext } from "@context/search-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

const PAGE_SIZE = 20;

const getSectionTitle = (
  availability?: ProductAvailabilityEnum,
  publiclyAvailable?: boolean,
) => {
  if (availability === ProductAvailabilityEnum.Available) {
    return "Tillgänglig nu";
  }
  if (availability === ProductAvailabilityEnum.Upcoming) {
    return "Kommande";
  }
  if (publiclyAvailable) {
    return "Externt publicerat";
  }
  return "Senast inkomna";
};

export default function InternalSearchPage() {
  return (
    <FilterProductScopeProvider scope="internal">
      <InternalSearchResults />
    </FilterProductScopeProvider>
  );
}

const InternalSearchResults = () => {
  const { q, availability, publiclyAvailable } = useLocalSearchParams<{
    q?: string;
    availability?: ProductAvailabilityEnum;
    publiclyAvailable?: string;
  }>();
  const query = q ?? "";
  const selectedAvailability =
    availability === ProductAvailabilityEnum.Available ||
    availability === ProductAvailabilityEnum.Upcoming
      ? availability
      : undefined;
  const selectedPubliclyAvailable =
    publiclyAvailable === "true" ? true : undefined;
  const sectionTitle = !query
    ? getSectionTitle(selectedAvailability, selectedPubliclyAvailable)
    : undefined;
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { height: screenHeight } = useWindowDimensions();
  const searchContext = useSearchContext();
  const { filterBuilder, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();
  const [showFilter, setShowFilter] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  useEffect(() => {
    filterBuilder.setSearchString(query).apply();
    searchContext.setSearchState({
      searchString: query,
      completedSearchString: query,
      searchScope: "internal",
      dropdownVisible: false,
    });
  }, [query, searchContext.setSearchState]);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;

    const animationFrameId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(animationFrameId);
  }, [availability, publiclyAvailable, query]);

  const input = {
    ...toProductsQueryInput(),
    availability: selectedAvailability,
    publiclyAvailable: selectedPubliclyAvailable,
    searchString: query,
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
    !!query &&
    !!data &&
    !loading &&
    exactProducts.length >= data.internalAds.total;
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
    hidePrice: true,
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

  const results = (
    <>
      {!!query ? (
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
      ) : (
        <View style={{ marginBottom: 24 }}>
          <Display size="small" heading={1}>
            {sectionTitle}
          </Display>
        </View>
      )}

      {!isDesktop && (
        <Pressable onPress={() => setShowMobileMap((visible) => !visible)}>
          {showMobileMap ? (
            <InteractiveMap
              searchScope="internal"
              productsInput={input}
              style={{ height: 320, marginBottom: 16 }}
            />
          ) : (
            <MapThumbnail
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
      <InternalTopBar />
      <ScreenLayout
        headerComponent={
          !isDesktop ? (
            <SearchBar
              onPressArrow={() => router.back()}
              placeholder="Sök i Återbanken"
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
        <FilterSlideSheet
          open={showFilter}
          onClose={() => setShowFilter(false)}
        />
      ) : (
        <FilterBottomSheet
          open={showFilter}
          onClose={() => setShowFilter(false)}
        />
      )}
    </View>
  );
};
