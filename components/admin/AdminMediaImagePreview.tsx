"use client";

/* eslint-disable @next/next/no-img-element */

import { useAuthenticatedMediaSrc } from "@/hooks/useAuthenticatedMediaSrc";
import { cn } from "@/lib/utils";

type AdminMediaImagePreviewProps = {
  url?: string;
  alt?: string;
  className?: string;
};

export function AdminMediaImagePreview({
  url,
  alt = "",
  className,
}: AdminMediaImagePreviewProps) {
  const { src, isLoading, error } = useAuthenticatedMediaSrc(url, {
    skip: !url?.trim(),
  });

  if (!url?.trim()) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground",
          className
        )}
      >
        Загрузка...
      </div>
    );
  }

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Не удалось загрузить изображение
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />
  );
}
