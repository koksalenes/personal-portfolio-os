"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Files, Monitor } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { Desktop } from "./Desktop";
import { viewStore } from "./store";

export function SiteView({ children }: Readonly<{ children: ReactNode }>) {
  const t = useTranslations("view");
  const view = viewStore.useValue();
  const isOs = view === "os";
  const Icon = isOs ? Files : Monitor;

  return (
    <>
      {isOs ? <Desktop>{children}</Desktop> : children}
      <button
        type="button"
        onClick={() => viewStore.write(isOs ? "text" : "os")}
        className={cn(
          "fixed bottom-5 left-5 z-[100] flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur transition-colors",
          isOs
            ? "border-white/15 bg-black/45 text-white hover:bg-black/60 max-md:bottom-28"
            : "border-border bg-surface/80 text-foreground hover:border-accent hover:text-accent",
        )}
      >
        <Icon className="h-4 w-4" />
        {t(isOs ? "text" : "os")}
      </button>
    </>
  );
}
