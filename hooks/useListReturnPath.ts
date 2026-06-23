"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { listPathWithQuery } from "@/lib/listNavigation";

export function useListReturnPath(listPath: string) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return useMemo(
    () => listPathWithQuery(listPath, queryString),
    [listPath, queryString]
  );
}
