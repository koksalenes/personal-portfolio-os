"use client";

import { useState, type ReactNode } from "react";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type SpotlightItem = {
  id: string;
  group: string;
  label: string;
  keywords?: string;
  icon: ReactNode;
  run: () => void;
};

export function Spotlight({
  items,
  onClose,
}: Readonly<{ items: SpotlightItem[]; onClose: () => void }>) {
  const t = useTranslations("desktop.spotlight");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const q = query.trim().toLowerCase();
  const results = items.filter((i) =>
    `${i.label} ${i.keywords ?? ""} ${i.group}`.toLowerCase().includes(q),
  );
  const current = Math.min(active, Math.max(0, results.length - 1));

  const choose = (item?: SpotlightItem) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[current]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex justify-center px-3 pt-[14vh]"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <m.div
        role="dialog"
        aria-label={t("placeholder")}
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-black/20 bg-white/80 text-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/40 backdrop-blur-2xl dark:bg-neutral-800/85 dark:text-white dark:ring-white/10"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="h-5 w-5 opacity-60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="os-plain min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:opacity-50"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto border-t border-black/10 p-1.5 dark:border-white/10">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm opacity-60">
              {t("empty")}
            </p>
          )}
          {results.map((item, i) => {
            const showGroup = results[i - 1]?.group !== item.group;
            return (
              <div key={item.id}>
                {showGroup && (
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold opacity-50">
                    {item.group}
                  </p>
                )}
                <button
                  type="button"
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm",
                    i === current && "bg-[#2f6fe4] text-white",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center text-[24px]">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </m.div>
    </div>
  );
}
