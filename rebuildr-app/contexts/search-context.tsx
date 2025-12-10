import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
} from "react";
import { useReducerState } from "@hooks/useReducerState";
import { DoSearchQuery, DoSearchQueryVariables } from "@/gql/graphql";
import { useLazyQuery, LazyQueryExecFunction } from "@apollo/client";
import { DO_SEARCH } from "@components/search/queries";

type StateType = {
  dropdownVisible: boolean;
  dropdownPosition: { x: number; y: number; width: number };
  searchData?: DoSearchQuery;
  searchString?: string;
};

const initialState: StateType = {
  dropdownVisible: false,
  dropdownPosition: { x: 0, y: 0, width: 0 },
  searchData: undefined,
  searchString: undefined,
};

type ContextType = {
  searchState: StateType;
  setSearchState: Dispatch<Partial<StateType>>;
  search: LazyQueryExecFunction<DoSearchQuery, DoSearchQueryVariables>;
  reset: () => void;
};

const Context = createContext<ContextType | null>(null);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);

  useEffect(() => {
    if (!state.dropdownVisible) {
      setState({ dropdownPosition: { x: 0, y: 0, width: 0 } });
    }
  }, [state.dropdownVisible]);

  const [search] = useLazyQuery<DoSearchQuery, DoSearchQueryVariables>(
    DO_SEARCH,
    {
      onCompleted: (data) => {
        setState({ searchData: data });
      },
    },
  );

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
