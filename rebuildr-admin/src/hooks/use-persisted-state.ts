import { useEffect, useReducer } from "react";
import { setItem, getItem } from "@utils/local-storage";

export function usePersistedState<T>(key: string, initialState: T) {
  const [state, setState] = useReducer(
    (state: T, newState: Partial<T>) => ({ ...state, ...newState }),
    initialState,
    (initial: T) => {
      const item = getItem(key);
      return (item as T) || initial;
    },
  );

  useEffect(() => {
    setItem(key, state);
  }, [state]);

  return [state, setState] as const;
}
