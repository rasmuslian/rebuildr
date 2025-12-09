import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
} from "react";
import { useReducerState } from "@hooks/useReducerState";
import { DoSearchQuery } from "@/gql/graphql";

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
};

const Context = createContext<ContextType | null>(null);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);

  useEffect(() => {
    if (!state.dropdownVisible) {
      setState({ dropdownPosition: { x: 0, y: 0, width: 0 } });
    }
  }, [state.dropdownVisible]);

  return (
    <Context.Provider
      value={{
        searchState: state,
        setSearchState: setState,
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
