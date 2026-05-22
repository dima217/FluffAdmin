import { useMemo } from "react";

export function useFilteredList<T>(
  items: T[] | undefined,
  search: string,
  matcher: (item: T, query: string) => boolean
): T[] {
  return useMemo(() => {
    if (!items) return [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => matcher(item, query));
  }, [items, search, matcher]);
}
