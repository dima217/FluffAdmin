import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getMediaBaseUrl } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type MediaUrlType = "direct" | "path" | "invalid";

/**
 * Проверяет, что URL — обычная http(s) ссылка (в т.ч. localhost).
 */
export function isDirectHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Если хост localhost/127.0.0.1 — подменяем на наш медиа-хост (IP), чтобы с телефона запрос уходил на сервер.
 */
function rewriteLocalhostToMediaHost(url: string): string {
  if (!isDirectHttpUrl(url)) return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "localhost" && host !== "127.0.0.1") return url;
    const base = getMediaBaseUrl().replace(/\/$/, "");
    const pathAndSearch = `${parsed.pathname}${parsed.search}`;
    return `${base}${pathAndSearch.startsWith("/") ? "" : "/"}${pathAndSearch}`;
  } catch {
    return url;
  }
}

/**
 * Тип URL: direct = http(s), path = путь вида /3/xxx.mp4 (нужен эндпоинт /media/download).
 */
export function getMediaUrlType(url: string | null | undefined): MediaUrlType {
  if (!url) return "invalid";
  if (url.startsWith("http://") || url.startsWith("https://")) return "direct";
  if (url.startsWith("/")) return "path";
  return "invalid";
}

/**
 * Нормализует URL для использования в Image/Video:
 * - http(s) — возвращаем как есть (localhost подменяем на mediaBaseUrl).
 * - путь (/3/xxx.mp4 и т.д.) — собираем URL стрима: ourip:3002/media/download?url=<path>.
 */
export function normalizeMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  const urlType = getMediaUrlType(url);

  if (urlType === "direct") {
    return rewriteLocalhostToMediaHost(url);
  }

  if (urlType === "path") {
    const base = getMediaBaseUrl().replace(/\/$/, "");
    return `${base}/media/download?url=${encodeURIComponent(url)}`;
  }

  return null;
}

/** Для обратной совместимости: path считаем «прокси» в смысле «через наш сервер». */
export function isProxyUrl(url: string | null | undefined): boolean {
  return getMediaUrlType(url) === "path";
}

export function isDirectUrl(url: string | null | undefined): boolean {
  return getMediaUrlType(url) === "direct";
}

/** Оставлено для совместимости; для path URL mediaId не используется. */
export function extractMediaId(_proxyUrl: string): string | null {
  return null;
}

export function getFullMediaUrl(proxyUrl: string): string {
  return normalizeMediaUrl(proxyUrl) ?? proxyUrl;
}

/** URL ведёт на наш медиа-сервер (3002) — для таких запросов нужен Authorization. */
export function isMediaServerUrl(
  resolvedUrl: string | null | undefined
): boolean {
  if (!resolvedUrl) return false;
  const base = getMediaBaseUrl().replace(/\/$/, "");
  return resolvedUrl === base || resolvedUrl.startsWith(base + "/");
}
