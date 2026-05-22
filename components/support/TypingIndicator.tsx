"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border shadow-sm">
        <span className="text-[10px] font-semibold text-blue-600">П</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
        </span>
        <span className="text-xs text-muted-foreground">печатает</span>
      </div>
    </div>
  );
}
