"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PendingFileChip } from "./MessageAttachments";

const MAX_FILES = 10;

interface ChatInputProps {
  onSend: (text: string, files?: File[]) => boolean | void | Promise<boolean | void>;
  onTypingChange?: (isTyping: boolean) => void;
  isSending?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onTypingChange,
  isSending = false,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    setText(value);
    if (value.length > 0) {
      onTypingChange?.(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => onTypingChange?.(false), 2000);
    } else {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      onTypingChange?.(false);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && pendingFiles.length === 0) return;

    const result = await onSend(
      trimmed,
      pendingFiles.length > 0 ? pendingFiles : undefined
    );
    if (result === false) return;

    setText("");
    setPendingFiles([]);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files].slice(0, MAX_FILES));
    e.target.value = "";
  };

  const canSend =
    !isSending && !disabled && (text.trim().length > 0 || pendingFiles.length > 0);

  return (
    <div className="border-t bg-white px-4 py-4 space-y-3">
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingFiles.map((file, index) => (
            <PendingFileChip
              key={`${file.name}-${index}`}
              name={file.name}
              isImage={file.type.startsWith("image/")}
              onRemove={() =>
                setPendingFiles((prev) => prev.filter((_, i) => i !== index))
              }
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-shadow">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFilePick}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
          disabled={isSending || disabled || pendingFiles.length >= MAX_FILES}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply..."
          disabled={isSending || disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent px-1 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            "min-h-[36px] max-h-32"
          )}
        />

        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          className={cn(
            "shrink-0 h-9 w-9 rounded-xl transition-all",
            canSend
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-200 text-gray-400"
          )}
          onClick={() => void handleSend()}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
