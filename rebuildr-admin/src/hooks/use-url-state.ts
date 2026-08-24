"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type UrlState = Record<string, string | undefined>;

/**
 * Keeps a small set of view options in the query string so a dashboard view
 * can be linked and shared. Values equal to their default are left out of the
 * URL, which keeps the common case clean.
 */
export function useUrlState<T extends UrlState>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const fromUrl = searchParams.get(String(key));
      if (fromUrl !== null) {
        result[key] = fromUrl as T[keyof T];
      }
    }
    return result;
  }, [defaults, searchParams]);

  const setValues = useCallback(
    (next: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === defaults[key]) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      //replace, not push: changing a filter should not stack history entries.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [defaults, pathname, router, searchParams],
  );

  return [values, setValues] as const;
}
