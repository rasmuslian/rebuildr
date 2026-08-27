import { useQuery } from "@apollo/client";
import { useState } from "react";
import { View } from "react-native";

import {
  InternalProjectProductsQuery,
  InternalProjectProductsQueryVariables,
  ProductStatusEnum,
} from "@/gql/graphql";
import { INTERNAL_PROJECT_PRODUCTS } from "@/queries/internal-projects";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { FilterBottomSheet } from "@components/filter-product/filter-bottom-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import { Body, Title } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";

const PAGE_SIZE = 20;

type Props = {
  projectId: string;
};

export const InternalProjectProducts = ({ projectId }: Props) => {
  const { isDesktop } = useScreenType();
  const { filter, filterBuilder, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();
  const [showFilter, setShowFilter] = useState(false);
  const { data, loading, fetchMore } = useQuery<
    InternalProjectProductsQuery,
    InternalProjectProductsQueryVariables
  >(INTERNAL_PROJECT_PRODUCTS, {
    variables: {
      input: { ...toProductsQueryInput(), projectId },
      limit: PAGE_SIZE,
      offset: 0,
    },
    skip: !projectId,
    notifyOnNetworkStatusChange: true,
  });

  const products = data?.internalAds.products ?? [];
  const total = data?.internalAds.total ?? 0;
  const isNarrowed = !!nrOfAppliedFilters() || !!filter.searchString;

  const onShowMore = async () => {
    if (loading) return;

    await fetchMore({
      variables: {
        limit: PAGE_SIZE,
        offset: Math.ceil(products.length / PAGE_SIZE),
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult?.internalAds.products.length) return previous;

        return {
          internalAds: {
            ...previous.internalAds,
            ...fetchMoreResult.internalAds,
            products: [
              ...previous.internalAds.products,
              ...fetchMoreResult.internalAds.products,
            ],
          },
        };
      },
    });
  };

  return (
    <View style={{ gap: 16 }}>
      <Title size="medium">Annonser i projektet</Title>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Body size="medium" color="secondary">
          {total} {total === 1 ? "träff" : "träffar"}:
        </Body>
        <View>
          <Button
            label="Sortera & filtrera"
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

      {!loading && total === 0 ? (
        <View style={{ gap: 16, alignItems: "flex-start", paddingBottom: 16 }}>
          <Body size="medium" color="secondary">
            {isNarrowed
              ? "Inga annonser matchar din filtrering."
              : "Det finns inga annonser i projektet ännu."}
          </Body>
          {isNarrowed && (
            <Button
              label="Rensa alla"
              type="tonal"
              onPress={() => filterBuilder.reset().apply()}
            />
          )}
        </View>
      ) : (
        <AdGridSection
          products={products.map((product) => ({
            id: product.id,
            title: product.title,
            imageUri: product.primaryImage?.url,
            quantity: product.primaryQuantity,
            quantityUnit: product.primaryUnit,
            condition: product.condition,
            price: product.price,
            hidePrice: true,
            soldByQuantity: product.soldByQuantity,
            status: product.status,
            heart: false,
            overlayText:
              product.status === ProductStatusEnum.Sold ? "Såld" : undefined,
            onPress: () =>
              router.navigate({
                pathname: "/internal/[productId]",
                params: { productId: product.id },
              }),
          }))}
          pagination={{ onShowMore, loading, total }}
        />
      )}

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
