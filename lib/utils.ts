import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  buildMediaApiUrl,
  buildMediaDownloadUrl,
  isOurMediaHostOrigin,
} from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type MediaUrlType = "direct" | "path" | "invalid";

export function isDirectHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

export function hasPresignedS3Query(url: string): boolean {
  try {
    const parsed = new URL(url);
    return [...parsed.searchParams.keys()].some((key) =>
      key.startsWith("X-Amz")
    );
  } catch {
    return /[?&]X-Amz-/i.test(url);
  }
}

export function stripUrlQuery(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    const qIndex = url.indexOf("?");
    return qIndex === -1 ? url : url.slice(0, qIndex);
  }
}

function shouldStripMediaQuery(url: string): boolean {
  return isOurMediaHostOrigin(url) || hasPresignedS3Query(url);
}

function rewriteLocalhostToMediaHost(url: string): string {
  if (!isDirectHttpUrl(url)) return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "localhost" && host !== "127.0.0.1") return url;
    return buildMediaApiUrl(parsed.pathname);
  } catch {
    return url;
  }
}

export function getMediaUrlType(url: string | null | undefined): MediaUrlType {
  if (!url) return "invalid";
  if (url.startsWith("http://") || url.startsWith("https://")) return "direct";
  if (url.startsWith("/")) return "path";
  return "invalid";
}

export function normalizeMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  const urlType = getMediaUrlType(url);

  if (urlType === "direct") {
    const rewritten = rewriteLocalhostToMediaHost(url);
    if (shouldStripMediaQuery(rewritten)) {
      return stripUrlQuery(rewritten);
    }
    return rewritten;
  }

  if (urlType === "path") {
    return buildMediaDownloadUrl(url);
  }

  return null;
}

export function isProxyUrl(url: string | null | undefined): boolean {
  return getMediaUrlType(url) === "path";
}

export function isDirectUrl(url: string | null | undefined): boolean {
  return getMediaUrlType(url) === "direct";
}

export function extractMediaId(_proxyUrl: string): string | null {
  return null;
}

export function getFullMediaUrl(proxyUrl: string): string {
  return normalizeMediaUrl(proxyUrl) ?? proxyUrl;
}

export function isMediaServerUrl(
  resolvedUrl: string | null | undefined
): boolean {
  return isOurMediaHostOrigin(resolvedUrl);
}
