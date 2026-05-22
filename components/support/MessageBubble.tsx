"use client";

import { format } from "date-fns";
import { Headphones, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMessageContent } from "@/lib/support/supportMessages";
import type { SupportMessageDto } from "@/types/support";
import { MessageAttachments } from "./MessageAttachments";

interface MessageBubbleProps {
  message: SupportMessageDto;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { title, body } = parseMessageContent(message.content);

  return (
    <div
      className={cn(
        "flex gap-2.5 mb-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
          isOwn
            ? "bg-indigo-600 text-white"
            : "bg-white border border-gray-200 text-blue-600"
        )}
      >
        {isOwn ? (
          <Headphones className="h-3.5 w-3.5" />
        ) : (
          <User className="h-3.5 w-3.5" />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col max-w-[72%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <span className="text-[11px] font-medium text-muted-foreground mb-1 px-1">
          {isOwn ? "Вы" : "Пользователь"}
        </span>

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
            isOwn
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-white text-gray-900 border border-gray-200/80 rounded-bl-md"
          )}
        >
          {title && (
            <p
              className={cn(
                "font-semibold leading-snug",
                body && "mb-1.5",
                isOwn ? "text-white" : "text-gray-900"
              )}
            >
              {title}
            </p>
          )}
          {body && (
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {body}
            </p>
          )}
          <MessageAttachments attachments={message.attachments} isOwn={isOwn} />
        </div>

        <p className="text-[11px] text-muted-foreground mt-1 px-1">
          {format(new Date(message.createdAt), "HH:mm")}
          {message.editedAt && " · изменено"}
        </p>
      </div>
    </div>
  );
}
