import { makeVar } from "@apollo/client";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";

import { OrderProductsEnum } from "@/gql/graphql";
import { ProjectDesktop } from "@components/project/project.desktop";
import { ProjectMobile } from "@components/project/project.mobile";
import { Filter, initialFilterProduct } from "@context/filter-product-context";
import {
  FilterProductScopeProvider,
  OwnFilterScope,
} from "@context/filter-product-scope-context";
import { useScreenType } from "@hooks/useScreenType";

// Relevance and distance both need something to rank against: a search term and
// spread-out ads. Within one project there is neither by default, so newest
// first is what the list actually starts as.
const PROJECT_SORTING_OPTIONS = [
  OrderProductsEnum.Latest,
  OrderProductsEnum.Oldest,
  OrderProductsEnum.PriceDesc,
  OrderProductsEnum.PriceAsc,
];

export default function ProjectPage() {
  const { isDesktop } = useScreenType();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  // A filter of its own per project, so opening one always starts on its full
  // ad list and nothing chosen here reaches the app-wide filter. It lives above
  // the desktop/mobile split because the screen type only settles after the
  // first render, which would otherwise build the filter twice.
  const scopeRef = useRef<
    { projectId: string; scope: OwnFilterScope } | undefined
  >(undefined);

  if (scopeRef.current?.projectId !== projectId) {
    const initialFilter: Filter = {
      ...initialFilterProduct,
      sorting: OrderProductsEnum.Latest,
    };

    scopeRef.current = {
      projectId,
      scope: {
        filterVar: makeVar<Filter>(initialFilter),
        initialFilter,
        sortingOptions: PROJECT_SORTING_OPTIONS,
        facetProjectId: projectId,
      },
    };
  }

  return (
    <FilterProductScopeProvider scope={scopeRef.current.scope}>
      {isDesktop ? <ProjectDesktop /> : <ProjectMobile />}
    </FilterProductScopeProvider>
  );
}
