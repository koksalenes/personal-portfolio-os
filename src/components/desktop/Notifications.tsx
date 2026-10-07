"use client";

import type { ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";

export type OsNotification = {
  id: number;
  title: string;
  body?: string;
  icon: ReactNode;
  onClick?: () => void;
};

export function Notifications({
  items,
  onDismiss,
}: Readonly<{ items: OsNotification[]; onDismiss: (id: number) => void }>) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-2 bottom-24 z-[110] flex w-[min(360px,calc(100%-16px))] flex-col gap-2 max-md:left-2 max-md:mx-auto md:top-9 md:bottom-auto"
    >
      <AnimatePresence>
        {items.map((n) => (
          <m.button
            key={n.id}
            type="button"
            layout
            onClick={() => {
              n.onClick?.();
              onDismiss(n.id);
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-black/10 bg-white/75 p-3 text-left text-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-800/80 dark:text-white"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center text-[36px]">
              {n.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{n.title}</span>
              {n.body && (
                <span className="block text-[12px] opacity-75">{n.body}</span>
              )}
            </span>
          </m.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
