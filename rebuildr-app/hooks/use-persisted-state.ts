import { useReducer, useEffect, useState } from "react";
import { getItem, setItem } from "@/utils/async-storage";

export function usePersistedState<T>(key: string, initialState: T) {
  const [state, setState] = useReducer(
    (state: T, newState: Partial<T>) => ({ ...state, ...newState }),
    initialState,
  );

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const item = await getItem(key);
      if (item !== undefined) setState(item as T);
      setIsHydrated(true);
    })();
  }, [key]);

  useEffect(() => {
    if (isHydrated) setItem(key, state);
  }, [key, state, isHydrated]);

  return [state, setState] as const;
}
