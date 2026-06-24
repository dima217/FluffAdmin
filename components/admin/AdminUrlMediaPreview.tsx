"use client";

import { AdminMediaImagePreview } from "./AdminMediaImagePreview";

type AdminUrlMediaPreviewProps = {
  url?: string;
  alt?: string;
};

export function AdminUrlMediaPreview({ url, alt = "" }: AdminUrlMediaPreviewProps) {
  if (!url?.trim()) return null;

  return (
    <div className="mt-2 h-48 w-full overflow-hidden rounded-md bg-muted">
      <AdminMediaImagePreview url={url} alt={alt} className="h-full w-full" />
    </div>
  );
}
