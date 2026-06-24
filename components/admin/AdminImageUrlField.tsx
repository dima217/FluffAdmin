"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImagePlus, XCircle } from "lucide-react";
import { AdminMediaImagePreview } from "./AdminMediaImagePreview";

type AdminImageUrlFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function AdminImageUrlField({
  id,
  label,
  value,
  onChange,
  required,
  placeholder = "https://... или /media/...",
}: AdminImageUrlFieldProps) {
  const hasValue = Boolean(value.trim());

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />

      <div
        className={cn(
          "relative h-[250px] w-full overflow-hidden rounded-[15px]",
          hasValue
            ? "bg-muted"
            : "flex items-center justify-center border border-dashed border-purple-400/50 bg-muted/30"
        )}
      >
        {hasValue ? (
          <>
            <AdminMediaImagePreview
              url={value}
              alt={label}
              className="absolute inset-0"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-2.5 rounded-full bg-background/80 p-0.5 text-purple-500 transition hover:bg-background"
              aria-label="Удалить изображение"
            >
              <XCircle className="h-8 w-8" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center text-muted-foreground">
            <ImagePlus className="h-14 w-14 text-purple-400/80" />
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Добавить фото
            </span>
            <span className="text-xs">Вставьте URL изображения выше</span>
            <span className="text-[11px] opacity-70">JPG, PNG, WEBP</span>
          </div>
        )}
      </div>
    </div>
  );
}
