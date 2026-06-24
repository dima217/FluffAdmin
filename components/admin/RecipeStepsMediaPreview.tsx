"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import { AdminMediaImagePreview } from "./AdminMediaImagePreview";

type RecipeStep = {
  name?: string;
  description?: string;
  resources?: Array<{ source?: string }>;
};

function parseStepsConfig(json: string): RecipeStep[] | null {
  if (!json.trim()) return [];

  try {
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.steps)) return [];
    return parsed.steps;
  } catch {
    return null;
  }
}

type RecipeStepsMediaPreviewProps = {
  stepsConfigJson: string;
};

export function RecipeStepsMediaPreview({
  stepsConfigJson,
}: RecipeStepsMediaPreviewProps) {
  const steps = useMemo(
    () => parseStepsConfig(stepsConfigJson),
    [stepsConfigJson]
  );

  if (steps === null) {
    return (
      <p className="text-sm text-destructive">
        Некорректный JSON — предпросмотр шагов недоступен
      </p>
    );
  }

  if (steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Предпросмотр шагов</p>
      <div className="space-y-6">
        {steps.map((step, index) => {
          const imageUrl = step.resources?.[0]?.source?.trim();
          const hasImage = Boolean(imageUrl);

          return (
            <div
              key={index}
              className="space-y-3 rounded-xl border p-4"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold">
                  Шаг {index + 1}
                  {step.name ? `: ${step.name}` : ""}
                </div>
                {step.description ? (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {step.description}
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  "relative h-[250px] w-full overflow-hidden rounded-[15px]",
                  hasImage
                    ? "bg-muted"
                    : "flex items-center justify-center border border-dashed border-purple-400/50 bg-muted/30"
                )}
              >
                {hasImage ? (
                  <AdminMediaImagePreview
                    url={imageUrl}
                    alt={step.name ?? `Шаг ${index + 1}`}
                    className="absolute inset-0"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
                    <ImagePlus className="h-10 w-10 text-purple-400/60" />
                    <span className="text-xs">Нет изображения шага</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
