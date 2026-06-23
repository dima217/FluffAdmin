"use client";

import { Suspense, type ReactNode } from "react";

export function ListPageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-muted-foreground">Загрузка...</div>
      }
    >
      {children}
    </Suspense>
  );
}
