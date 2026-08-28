import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
  useRef,
} from "react";
import { useReducerState } from "@hooks/useReducerState";
import {
  DoSearchQuery,
  DoSearchQueryVariables,
  InternalAdsSearchQuery,
  InternalAdsSearchQueryVariables,
} from "@/gql/graphql";
import { useLazyQuery } from "@apollo/client";
import { DO_SEARCH } from "@components/search/queries";
import { useDebounce } from "@hooks/use-debounce";
import { INTERNAL_ADS_SEARCH } from "@/queries/internal-ads";

export type SearchScope = "public" | "internal";

type StateType = {
  dropdownVisible: boolean;
  dropdownSource?: "navbar" | "hero" | "other";
  dropdownHideTopDivider: boolean;
  dropdownPosition: { x: number; y: number; width: number };
  dropdownAnchorPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  searchData?: DoSearchQuery;
  internalSearchData?: InternalAdsSearchQuery;
  searchString?: string;
  completedSearchString?: string;
  searchScope: SearchScope;
};

const initialState: StateType = {
  dropdownVisible: false,
  dropdownSource: undefined,
  dropdownHideTopDivider: false,
  dropdownPosition: { x: 0, y: 0, width: 0 },
  dropdownAnchorPosition: { x: 0, y: 0, width: 0, height: 0 },
  searchData: undefined,
  internalSearchData: undefined,
  searchString: undefined,
  completedSearchString: undefined,
  searchScope: "public",
};

type ContextType = {
  searchState: StateType;
  setSearchState: Dispatch<Partial<StateType>>;
  reset: () => void;
  search: (text: string, scope?: SearchScope) => void;
};

const Context = createContext<ContextType | null>(null);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const latestSearchRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!state.dropdownVisible) {
      setState({
        dropdownHideTopDivider: false,
        dropdownPosition: { x: 0, y: 0, width: 0 },
        dropdownAnchorPosition: { x: 0, y: 0, width: 0, height: 0 },
      });
    }
  }, [state.dropdownVisible]);

  const [doSearch] = useLazyQuery<DoSearchQuery, DoSearchQueryVariables>(
    DO_SEARCH,
  );
  const [doInternalSearch] = useLazyQuery<
    InternalAdsSearchQuery,
    InternalAdsSearchQueryVariables
  >(INTERNAL_ADS_SEARCH);

  const runSearch = useDebounce(
    (text: string, scope: SearchScope, searchKey: string | undefined) => {
      const searchString = text.trim();

      setState({
        searchData: undefined,
        internalSearchData: undefined,
        completedSearchString: undefined,
        searchScope: scope,
      });

      if (searchString.length > 0) {
        if (scope === "internal") {
          doInternalSearch({
            variables: {
              input: { searchString },
            },
          }).then(({ data }) => {
            if (!data || latestSearchRef.current !== searchKey) return;

            setState({
              internalSearchData: data,
              completedSearchString: searchString,
              searchScope: scope,
            });
          });
          return;
        }

        doSearch({
          variables: {
            searchSuggestionsInput: { searchString, limit: 8 },
            productsInput: { searchString, onlyPublished: true },
            categoriesInput: {},
            usersInput: { name: searchString },
          },
        }).then(({ data }) => {
          if (!data || latestSearchRef.current !== searchKey) return;

          setState({
            searchData: data,
            completedSearchString: searchString,
            searchScope: scope,
          });
        });
      }
    },
    300,
  );

  const search = (text: string, scope: SearchScope = "public") => {
    const searchString = text.trim();
    const searchKey = searchString ? `${scope}:${searchString}` : undefined;
    latestSearchRef.current = searchKey;
    runSearch(text, scope, searchKey);
  };

  const reset = () => {
    latestSearchRef.current = undefined;
    setState(initialState);
  };

  return (
    <Context.Provider
      value={{
        searchState: state,
        setSearchState: setState,
        search,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useSearchContext = () => {
  const contextData = useContext(Context);

  if (!contextData) {
    throw new Error("Search context is used outside of its provider.");
  }
  return contextData;
};
