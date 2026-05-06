import { useMemo } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/lib/store";

import {
  getMediaUrlType,
  normalizeMediaUrl,
  isMediaServerUrl,
  isProxyUrl,
} from "@/lib/utils";

export function useMediaUrl(
  url: string | null | undefined,
  options?: {
    skip?: boolean;
    placeholder?: string;
  }
) {
  const token = useSelector((state: RootState) => state.auth?.accessToken);

  const urlType = useMemo(() => getMediaUrlType(url), [url]);
  const normalizedUrl = useMemo(() => normalizeMediaUrl(url), [url]);

  const finalUrl = useMemo(() => {
    if (!url || options?.skip) {
      return options?.placeholder ?? null;
    }

    return normalizedUrl ?? options?.placeholder ?? null;
  }, [url, normalizedUrl, options?.skip, options?.placeholder]);

  const headers = useMemo(() => {
    if (!finalUrl || !isMediaServerUrl(finalUrl)) return undefined;
    if (!token) return undefined;

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [finalUrl, token]);

  return {
    url: finalUrl,
    headers,
    normalizedUrl: normalizedUrl ?? undefined,
    urlType,
    isProxy: isProxyUrl(url),
    isLoading: false,
    error: undefined,
    refetch: () => {},
    canUseDirectly: urlType === "direct",
  };
}
