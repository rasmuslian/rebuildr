import { useCallback, useRef } from "react";

export const useDebounce = (
  callback: (...args: any[]) => void,
  delay: number,
) => {
  const timeoutRef = useRef<number | null>(null);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  return debouncedFunction;
};