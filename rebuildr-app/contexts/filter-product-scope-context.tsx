import { ReactiveVar } from "@apollo/client";
import { PropsWithChildren, createContext, useContext } from "react";

import { OrderProductsEnum } from "@/gql/graphql";
import { Filter } from "@context/filter-product-context";

// A listing that keeps its own filter rather than sharing the app-wide one, and
// is never restored from a previous session. Used by a single project's ads.
export type OwnFilterScope = {
  filterVar: ReactiveVar<Filter>;
  // What "unfiltered" means here: the state Rensa alla returns to, and the one
  // the applied-filter count is measured against.
  initialFilter: Filter;
  // Which sortings this listing offers. Left out, all of them are.
  sortingOptions?: OrderProductsEnum[];
  // Set to count how many ads each category, brand and condition has within the
  // project. Left out, the filter lists show no counts.
  facetProjectId?: string;
};

export type FilterProductScope = "public" | "internal" | OwnFilterScope;

export const isOwnFilterScope = (
  scope: FilterProductScope,
): scope is OwnFilterScope => typeof scope === "object";

const FilterProductScopeContext = createContext<FilterProductScope>("public");

export const FilterProductScopeProvider = ({
  children,
  scope,
}: PropsWithChildren<{ scope: FilterProductScope }>) => (
  <FilterProductScopeContext.Provider value={scope}>
    {children}
  </FilterProductScopeContext.Provider>
);

export const useFilterProductScope = () =>
  useContext(FilterProductScopeContext);
