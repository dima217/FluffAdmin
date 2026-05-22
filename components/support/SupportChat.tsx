"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import type { SupportMessageDto } from "@/types/support";
import { formatChatDateLabel } from "@/lib/formatDate";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

interface SupportChatProps {
  ticketId: number;
  disabled?: boolean;
  userId?: number;
  subject?: string;
}

function groupMessagesByDate(messages: SupportMessageDto[]) {
  const groups: { label: string; messages: SupportMessageDto[] }[] = [];

  for (const message of messages) {
    const label = formatChatDateLabel(new Date(message.createdAt));
    const last = groups[groups.length - 1];

    if (last?.label === label) {
      last.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }

  return groups;
}

export function SupportChat({
  ticketId,
  disabled,
  userId,
  subject,
}: SupportChatProps) {
  const {
    messages,
    isUserTyping,
    isLoadingMessages,
    isUploading,
    sendMessage,
    notifyTyping,
  } = useSupportChat(ticketId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isUserTyping]);

  return (
    <div className="flex flex-col h-[min(300px,calc(100vh-220px))] min-h-[600px] rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b bg-linear-to-r from-slate-50 to-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {subject ?? `Тикет #${ticketId}`}
              </p>
              {userId != null && (
                <p className="text-xs text-muted-foreground">
                  Пользователь #{userId}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Онлайн</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Загрузка переписки...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border shadow-sm">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Сообщений пока нет</p>
              <p className="text-xs text-muted-foreground mt-1">
                Начните переписку с пользователем
              </p>
            </div>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border/80" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground px-2">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-border/80" />
              </div>

              {group.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderType === "admin"}
                />
              ))}
            </div>
          ))
        )}

        {isUserTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {disabled ? (
        <div className="border-t bg-muted/40 px-5 py-3 text-center text-sm text-muted-foreground">
          Тикет закрыт — чат только для чтения
        </div>
      ) : (
        <ChatInput
          onSend={sendMessage}
          onTypingChange={notifyTyping}
          isSending={isUploading}
          disabled={disabled}
        />
      )}
    </div>
  );
}
