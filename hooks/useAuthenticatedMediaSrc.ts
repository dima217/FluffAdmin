import { useEffect, useState } from "react";

import { useMediaUrl } from "./useMediaUrl";

/**
 * Возвращает src для <video>/<audio>: нормализует URL и при необходимости
 * загружает через fetch + blob (HTML media не поддерживает Authorization headers).
 */
export function useAuthenticatedMediaSrc(
  url: string | null | undefined,
  options?: { skip?: boolean }
) {
  const media = useMediaUrl(url, options);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!media.url || options?.skip) {
      setBlobUrl(null);
      setError(false);
      return;
    }

    if (!media.headers) {
      setBlobUrl(null);
      setError(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(media.url, { headers: media.headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch media");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setBlobUrl(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.url, media.headers, options?.skip]);

  const src = blobUrl ?? (media.headers && !error ? null : media.url);

  return {
    src,
    isLoading: Boolean(media.url && media.headers && !blobUrl && !error),
    error,
  };
}
