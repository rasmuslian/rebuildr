import {
  SearchProductsQuery,
  SearchProductsQueryVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/cards/ad-grid";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { SearchBar } from "@components/search/search-bar";
import { Body, Display } from "@components/typography/text";
import { defaultApproximateLocation } from "@constants/map";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
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
  }
`;

export default function Products() {
  const [offset, setOffset] = useState(0);
  const { searchString } = useLocalSearchParams<{ searchString: string }>();
  const colors = useThemeColor();
  const productsPerPage = 10;

  const { data, loading, refetch, fetchMore } = useQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SEARCH_PRODUCTS_QUERY, {
    variables: {
      input: {
        searchString,
      },
      limit: productsPerPage,
      offset,
    },
  });

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: productsPerPage,
        offset: offset + 1,
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

  return (
    <ScreenLayout
      loading={loading}
      headerComponent={
        <View style={[{ marginBottom: 24, gap: 16 }]}>
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
              onFocus={() => router.navigate("/(app)/search")}
              onPressArrow={() =>
                router.canGoBack() ? router.back() : router.navigate("/")
              }
            />
          </View>
        </View>
      }
      footerComponent={
        <Button
          label="Läs in fler"
          onPress={onShowMore}
          disabled={
            data && data.products.products.length >= data.products.total
          }
          style={{ marginTop: 24 }}
        />
      }
    >
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

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Body size="medium" style={{ flex: 1 }} color="secondary">
          {data?.products.total ?? 0} träffar:
        </Body>
        <Button
          label="Fraktleverans"
          onPress={() => {
            //TODO: Type of delivery chosen here
          }}
          type="tonal"
        />
        <Button
          icon="filterList2"
          type="tonal"
          onPress={() => {
            //TODO: Navigate to filter
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
          marginTop: 16,
        }}
      >
        {data?.products.products.map((product) => (
          <AdGrid
            key={product.id}
            imageUri={product.primaryImage?.url}
            title={product.title}
            amount={product.primaryQuantity ?? 0}
            condition={product.condition}
            rating={product.seller.rating ?? 3}
            isBusiness={product.seller.type === UserType.Business}
            location={
              product.approximatePlace?.address ?? defaultApproximateLocation
            }
            price={product.price}
            onPress={() => {
              //TODO: link to Product details page
            }}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
