import { useQuery } from "@apollo/client";
import { useState } from "react";
import { View } from "react-native";

import {
  GetProjectQuery,
  ProductAvailabilityEnum,
  ProjectProductsQuery,
  ProjectProductsQueryVariables,
} from "@/gql/graphql";
import { PROJECT_PRODUCTS } from "@/queries";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { FilterBottomSheet } from "@components/filter-product/filter-bottom-sheet";
import { FilterSlideSheet } from "@components/filter-product/filter-slide-sheet";
import { Body, Title } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useScreenType } from "@hooks/useScreenType";

const PAGE_SIZE = 20;

type Props = {
  projectId: string;
  header?: string;
  user: GetProjectQuery["getProject"]["user"] | undefined;
  meId: string | undefined;
};

export const ProjectProducts = ({ projectId, header, user, meId }: Props) => {
  const { isDesktop } = useScreenType();
  const { onToggleProductHeart } = useLikeProduct();
  const { filter, filterBuilder, nrOfAppliedFilters, toProductsQueryInput } =
    useFilterProduct();
  const [showFilter, setShowFilter] = useState(false);

  const { data, loading, fetchMore } = useQuery<
    ProjectProductsQuery,
    ProjectProductsQueryVariables
  >(PROJECT_PRODUCTS, {
    variables: {
      input: { ...toProductsQueryInput(), projectId },
      limit: PAGE_SIZE,
      offset: 0,
    },
    skip: !projectId,
    // Without this, loading stays false through fetchMore and the "load more"
    // button keeps firing, refetching the same page over the one after it.
    notifyOnNetworkStatusChange: true,
  });

  const products = data?.products.products ?? [];
  const total = data?.products.total ?? 0;
  const isNarrowed = !!nrOfAppliedFilters() || !!filter.searchString;

  // The offset is a page index rather than a row count.
  const onShowMore = async () => {
    if (loading) {
      return;
    }

    await fetchMore({
      variables: {
        limit: PAGE_SIZE,
        offset: Math.ceil(products.length / PAGE_SIZE),
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
    <View style={{ gap: 16 }}>
      {!!header && <Title size="medium">{header}</Title>}

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
        <View style={{ flex: 1 }} />
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
            imageUri: product.primaryImage?.url,
            liked: !!product.likedByMe,
            heart: user?.id !== meId,
            quantity: product.primaryQuantity,
            quantityUnit: product.primaryUnit,
            condition: product.condition,
            account: {
              rating: user?.rating,
              type: user?.type,
              location: product.approximatePlace?.address,
            },
            title: product.title,
            price: product.price,
            soldByQuantity: product.soldByQuantity,
            status: product.status,
            upcoming: product.availability === ProductAvailabilityEnum.Upcoming,
            onHeartPress: () => {
              onToggleProductHeart({
                productId: product.id,
                likedByMe: !!product.likedByMe,
              });
            },
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
