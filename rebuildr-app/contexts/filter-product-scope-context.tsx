import { PropsWithChildren, createContext, useContext } from "react";

export type FilterProductScope = "public" | "internal";

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
