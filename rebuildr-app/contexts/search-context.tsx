import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
  useRef,
} from "react";
import { useReducerState } from "@hooks/useReducerState";
import { DoSearchQuery, DoSearchQueryVariables } from "@/gql/graphql";
import { useLazyQuery } from "@apollo/client";
import { DO_SEARCH } from "@components/search/queries";
import { useDebounce } from "@hooks/use-debounce";

type StateType = {
  dropdownVisible: boolean;
  dropdownPosition: { x: number; y: number; width: number };
  dropdownAnchorPosition: { x: number; y: number; width: number; height: number };
  searchData?: DoSearchQuery;
  searchString?: string;
  completedSearchString?: string;
};

const initialState: StateType = {
  dropdownVisible: false,
  dropdownPosition: { x: 0, y: 0, width: 0 },
  dropdownAnchorPosition: { x: 0, y: 0, width: 0, height: 0 },
  searchData: undefined,
  searchString: undefined,
  completedSearchString: undefined,
};

type ContextType = {
  searchState: StateType;
  setSearchState: Dispatch<Partial<StateType>>;
  reset: () => void;
  search: (text: string) => void;
};

const Context = createContext<ContextType | null>(null);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const latestSearchStringRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!state.dropdownVisible) {
      setState({
        dropdownPosition: { x: 0, y: 0, width: 0 },
        dropdownAnchorPosition: { x: 0, y: 0, width: 0, height: 0 },
      });
    }
  }, [state.dropdownVisible]);

  const [doSearch] = useLazyQuery<DoSearchQuery, DoSearchQueryVariables>(
    DO_SEARCH,
  );

  const search = useDebounce((text: string) => {
    const searchString = text.trim();
    latestSearchStringRef.current = searchString || undefined;

    setState({
      searchData: undefined,
      completedSearchString: undefined,
    });

    if (searchString.length > 0) {
      doSearch({
        variables: {
          searchResultsInput: { searchString },
          productsInput: { searchString },
          categoriesInput: {},
          usersInput: { name: searchString },
        },
      }).then(({ data }) => {
        if (!data || latestSearchStringRef.current !== searchString) return;

        setState({
          searchData: data,
          completedSearchString: searchString,
        });
      });
    }
  }, 300);

  const reset = () => setState(initialState);

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
