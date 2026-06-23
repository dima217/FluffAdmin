"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UseListQueryParamsOptions = {
  tabKey?: string;
  tabDefault?: string;
};

export function useListQueryParams(options: UseListQueryParamsOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("q") ?? "";
  const tab = options.tabKey
    ? searchParams.get(options.tabKey) ?? options.tabDefault ?? ""
    : undefined;

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      replaceParams((params) => {
        if (nextPage <= 1) params.delete("page");
        else params.set("page", String(nextPage));
      });
    },
    [replaceParams]
  );

  const setSearch = useCallback(
    (q: string) => {
      replaceParams((params) => {
        if (q) params.set("q", q);
        else params.delete("q");
        params.delete("page");
      });
    },
    [replaceParams]
  );

  const setTab = useCallback(
    (value: string) => {
      if (!options.tabKey) return;
      replaceParams((params) => {
        if (!value || value === options.tabDefault) {
          params.delete(options.tabKey!);
        } else {
          params.set(options.tabKey!, value);
        }
        params.delete("page");
      });
    },
    [options.tabKey, options.tabDefault, replaceParams]
  );

  const queryString = useMemo(() => searchParams.toString(), [searchParams]);

  const hrefWithQuery = useCallback(
    (path: string) => {
      const qs = searchParams.toString();
      return qs ? `${path}?${qs}` : path;
    },
    [searchParams]
  );

  return {
    page,
    search,
    tab,
    setPage,
    setSearch,
    setTab,
    queryString,
    hrefWithQuery,
  };
}
