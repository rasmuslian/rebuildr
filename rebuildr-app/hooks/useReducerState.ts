import { useReducer } from "react";

export function useReducerState<T>(initialState: T) {
  const [state, setState] = useReducer(
    (state: T, newState: Partial<T>) => ({ ...state, ...newState }),
    initialState,
  );

  return [state, setState] as const;
}
