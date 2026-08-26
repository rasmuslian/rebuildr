import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { ProductFacetsQuery, ProductFacetsQueryVariables } from "@/gql/graphql";
import { PRODUCT_FACETS } from "@/queries";
import {
  isOwnFilterScope,
  useFilterProductScope,
} from "@context/filter-product-scope-context";
import { useFilterProduct } from "@hooks/useFilterProduct";

type FacetCount = { id: string; count: number };

const toCountMap = (rows?: FacetCount[]) =>
  new Map((rows ?? []).map((row) => [row.id, row.count]));

export const useProductFacets = () => {
  const scope = useFilterProductScope();
  const { filter } = useFilterProduct();
  const projectId = isOwnFilterScope(scope) ? scope.facetProjectId : undefined;

  const { data } = useQuery<ProductFacetsQuery, ProductFacetsQueryVariables>(
    PRODUCT_FACETS,
    {
      variables: { input: { projectId, searchString: filter.searchString } },
      skip: !projectId,
      // A backend without this query must not take the filter lists down with it.
      errorPolicy: "all",
    },
  );

  return useMemo(() => {
    const facets = data?.productFacets;
    const categories = toCountMap(facets?.categories);
    const rootCategories = toCountMap(facets?.rootCategories);
    const brands = toCountMap(facets?.brands);
    const conditions = toCountMap(facets?.conditions);

    return {
      // Only once counts are in hand: while they load, or if the API has no
      // facets to give, the lists stay full rather than collapsing to nothing.
      enabled: !!projectId && !!facets,
      // A root rolls up its children, so prefer that tally where both exist.
      categoryCount: (id: string) =>
        rootCategories.get(id) ?? categories.get(id) ?? 0,
      brandCount: (id: string) => brands.get(id) ?? 0,
      conditionCount: (id: string) => conditions.get(id) ?? 0,
    };
  }, [projectId, data]);
};
