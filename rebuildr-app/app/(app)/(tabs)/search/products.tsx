import { isLoggedInVar } from "@/apollo/config";
import {
  SearchProductsQuery,
  SearchProductsQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Badge } from "@components/badges/badge";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { Header } from "@components/navigation/headers/header";
import { Icon } from "@icons/icon";
import { textStyles } from "@components/typography/typeface";
import { useThemeColor } from "@hooks/useThemeColor";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import {
  TransportationFilterOptions,
  TransportationOptions,
} from "@components/search/transportation-options";
import { SubCategoriesList } from "@components/categories/sub-categories-list/sub-categories-list";

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
        status
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
  const [showFilter, setShowFilter] = useState(false);
  const [transportationLabel, setTransportationLabel] =
    useState("Alla leveranssätt");

  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const { searchString: searchStringParam } = useLocalSearchParams<{
    searchString: string;
  }>();
  const [searchString, setSearchString] = useState(searchStringParam ?? "");

  const { filter, nrOfAppliedFilters, resetSelectedCategory } =
    useFilterProduct();

  const isLoggedIn = isLoggedInVar();
  const productsPerPage = 10;
  const [showTransportSheet, setShowTransportSheet] = useState(false);
  const { onToggleProductHeart } = useLikeProduct();

  const { data, loading, refetch, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    variables: {
      input: {
        searchString,
        orderBy: filter.sorting,
        categoryIds: filter.categoryIds
          ? filter.categoryIds
          : filter.rootCategoryIds
            ? filter.rootCategoryIds
            : undefined,
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

  const onApplyTranportationOptions = async (
    options: TransportationFilterOptions,
  ) => {
    await refetch({
      input: {
        searchString,
        orderBy: filter.sorting,
        categoryIds: filter.categoryIds,
        brandIds: filter.brandIds,
        conditions: filter.conditions,
        minPrice: filter.price[0],
        maxPrice: filter.price[1],
        ...options,
      },
    });
    setShowTransportSheet(false);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  useEffect(() => {
    setSearchString(searchStringParam ?? "");
    if (searchStringParam) {
      resetSelectedCategory();
    }
  }, [searchStringParam]);

  return (
    <>
      <ScreenLayout
        loading={loading}
        style={{ marginTop: 24 }}
        desktopFooter
        headerComponent={
          isDesktop ? (
            <TopBar showFor={["desktop"]} theme="light" />
          ) : (
            <Header
              showBackButton={false}
              middle={
                <>
                  <Icon
                    icon="search"
                    size={18}
                    style={{ marginRight: 10, height: 40 }}
                  />
                  <TextInput
                    style={{
                      outline: "none",
                      flex: 1,
                      color: colors.text.primaryDark,
                      ...textStyles.title["medium"],
                    }}
                    placeholder="Vad letar du efter?"
                    placeholderTextColor={colors.text.secondary}
                    value={searchString}
                    onFocus={() => router.navigate("/(app)/(tabs)/search")}
                  />
                </>
              }
            />
          )
        }
      >
        {!!searchString && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: isDesktop ? "flex-start" : "center",
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

        {!!filter.selectedCategoryId && (
          <SubCategoriesList id={filter.selectedCategoryId} />
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: isDesktop ? 32 : 16,
          }}
        >
          <Body size="medium" style={{ flex: 1 }} color="secondary">
            {data?.products.total ?? 0}{" "}
            {data?.products.total === 1 ? "träff" : "träffar"}:
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
              onPress={() => {
                if (isDesktop) {
                  setShowFilter(true);
                } else {
                  router.navigate("/search/filter");
                }
              }}
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
            })) ?? []
          }
          pagination={{
            onShowMore,
            total: data?.products.total ?? 0,
            loading,
          }}
        />
      </ScreenLayout>
      {isDesktop ? (
        <>
          <SlideInSheet
            open={showTransportSheet}
            onClose={() => setShowTransportSheet(false)}
            title="Leveransalternativ"
          >
            <TransportationOptions
              data={data}
              loading={loading}
              setTransportationLabel={setTransportationLabel}
              onApply={onApplyTranportationOptions}
            />
          </SlideInSheet>
          <FilterSlideSheet
            open={showFilter}
            onClose={() => setShowFilter(false)}
          />
        </>
      ) : (
        <BottomSheet
          open={showTransportSheet}
          onDismiss={() => setShowTransportSheet(false)}
          name="delivery"
          title="Leveransalternativ"
          scrollable
        >
          <TransportationOptions
            data={data}
            loading={loading}
            setTransportationLabel={setTransportationLabel}
            onApply={onApplyTranportationOptions}
          />
        </BottomSheet>
      )}
    </>
  );
}
