"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "framer-motion";
import { Moon, Sun } from "@/components/ui/icons";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    const prefersReduced =
      globalThis.window !== undefined &&
      globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReduced) {
      setTheme(next);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }

  const themeKey = isDark ? "moon" : "sun";
  const iconKey = mounted ? themeKey : "placeholder";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggle")}
      title={t("toggle")}
      className="group border-border bg-surface/60 text-foreground hover:border-accent hover:text-accent relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={iconKey}
          initial={{ y: -18, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 18, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="absolute"
        >
          {mounted && isDark ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
