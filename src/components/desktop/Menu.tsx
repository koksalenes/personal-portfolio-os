"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/cn";

export type MenuEntry =
  | {
      type: "item";
      label: string;
      onSelect: () => void;
      shortcut?: string;
      checked?: boolean;
      disabled?: boolean;
    }
  | { type: "sep" }
  | { type: "label"; label: string };

export const item = (
  label: string,
  onSelect: () => void,
  opts: { shortcut?: string; checked?: boolean; disabled?: boolean } = {},
): MenuEntry => ({ type: "item", label, onSelect, ...opts });

export const sep: MenuEntry = { type: "sep" };

export const heading = (label: string): MenuEntry => ({ type: "label", label });

export function MenuPanel({
  entries,
  onClose,
  className,
  style,
  autoFocus = false,
}: Readonly<{
  entries: MenuEntry[];
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
}>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus)
      ref.current
        ?.querySelector<HTMLElement>("[role=menuitem]")
        ?.focus({ preventScroll: true });
  }, [autoFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const items = [
      ...(ref.current?.querySelectorAll<HTMLElement>(
        "[role=menuitem]:not([disabled])",
      ) ?? []),
    ];
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
      items.at(next % items.length)?.focus({ preventScroll: true });
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <m.div
      ref={ref}
      role="menu"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12 }}
      onKeyDown={onKeyDown}
      style={style}
      className={cn(
        "min-w-56 rounded-lg border border-black/20 bg-white/80 p-1 text-[13px] text-neutral-900 shadow-[0_12px_40px_rgba(0,0,0,0.3)] ring-1 ring-white/40 backdrop-blur-2xl dark:bg-neutral-800/85 dark:text-white/90 dark:ring-white/10",
        className,
      )}
    >
      {entries.map((entry, i) => {
        if (entry.type === "sep")
          return (
            <div
              key={i}
              role="separator"
              className="mx-2 my-1 h-px bg-black/10 dark:bg-white/10"
            />
          );
        if (entry.type === "label")
          return (
            <p
              key={i}
              className="px-2.5 pt-1.5 pb-0.5 text-[11px] font-semibold opacity-50"
            >
              {entry.label}
            </p>
          );
        return (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={entry.disabled}
            onClick={() => {
              onClose();
              entry.onSelect();
            }}
            className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-[3px] text-left outline-none hover:bg-[#2f6fe4] hover:text-white focus-visible:bg-[#2f6fe4] focus-visible:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit"
          >
            <span className="w-3 shrink-0 text-xs">
              {entry.checked ? "✓" : ""}
            </span>
            <span className="flex-1 truncate">{entry.label}</span>
            {entry.shortcut && (
              <span className="ml-6 opacity-50">{entry.shortcut}</span>
            )}
          </button>
        );
      })}
    </m.div>
  );
}

export function ContextMenu({
  x,
  y,
  entries,
  onClose,
}: Readonly<{
  x: number;
  y: number;
  entries: MenuEntry[];
  onClose: () => void;
}>) {
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    el.style.left = `${Math.max(4, Math.min(x, window.innerWidth - width - 4))}px`;
    el.style.top = `${Math.max(30, Math.min(y, window.innerHeight - height - 4))}px`;
  }, [x, y]);

  return (
    <div
      className="fixed inset-0 z-[120]"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div ref={wrap} className="absolute" style={{ left: x, top: y }}>
        <MenuPanel entries={entries} onClose={onClose} autoFocus />
      </div>
    </div>
  );
}
