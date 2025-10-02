"use client";

import { useEffect, useReducer, useState } from "react";
import { setItem, getItem } from "@utils/local-storage";

export function usePersistedState<T>(key: string, initialState: T) {
  const [hydrated, setHydrated] = useState(false);

  const [state, setState] = useReducer(
    (state: T, newState: Partial<T>) => ({ ...state, ...newState }),
    initialState,
  );

  useEffect(() => {
    const item = getItem(key);
    if (item) setState(item as T);
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) setItem(key, state);
  }, [hydrated, key, state]);

  return [state, setState] as const;
}
