/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import { FileText, ImageIcon } from "lucide-react";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { cn, getMediaUrlType } from "@/lib/utils";
import type { SupportMessageAttachment } from "@/types/support";

function isImageAttachment(attachment: SupportMessageAttachment): boolean {
  if (attachment.type === "image") return true;
  if (attachment.type === "file") return false;

  if (/\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)(\?|$)/i.test(attachment.url)) {
    return true;
  }

  return getMediaUrlType(attachment.url) === "path";
}

function AttachmentImage({
  attachment,
}: {
  attachment: SupportMessageAttachment;
}) {
  const media = useMediaUrl(attachment.url, { skip: !attachment.url });

  if (!media.url) return null;

  return (
    <img
      src={media.url}
      alt={attachment.name ?? "attachment"}
      className="w-full max-w-sm h-48 object-cover rounded-md mt-2"
      {...(media.headers ? { headers: media.headers } : {})}
    />
  );
}

function AttachmentFile({
  attachment,
  isOwn,
}: {
  attachment: SupportMessageAttachment;
  isOwn: boolean;
}) {
  const media = useMediaUrl(attachment.url, { skip: !attachment.url });
  const href = media.url ?? attachment.url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 mt-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
        isOwn
          ? "bg-white/15 hover:bg-white/25 text-white"
          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[200px]">
        {attachment.name ?? "Download file"}
      </span>
    </a>
  );
}

export function MessageAttachments({
  attachments,
  isOwn = false,
}: {
  attachments?: SupportMessageAttachment[];
  isOwn?: boolean;
}) {
  if (!attachments?.length) return null;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {attachments.map((attachment, index) =>
        isImageAttachment(attachment) ? (
          <AttachmentImage
            key={`${attachment.url}-${index}`}
            attachment={attachment}
          />
        ) : (
          <AttachmentFile
            key={`${attachment.url}-${index}`}
            attachment={attachment}
            isOwn={isOwn}
          />
        )
      )}
    </div>
  );
}

export function PendingFileChip({
  name,
  isImage,
  onRemove,
}: {
  name: string;
  isImage?: boolean;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
      {isImage ? (
        <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
      ) : (
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className="max-w-[120px] truncate">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground ml-0.5"
        aria-label="Remove file"
      >
        ×
      </button>
    </span>
  );
}
