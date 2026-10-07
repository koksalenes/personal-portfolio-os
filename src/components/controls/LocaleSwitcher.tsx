"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { localeStorageKey, locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const active = useLocale();
  const t = useTranslations("locale");
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(code: Locale) {
    const target =
      code === active ? (locales.find((l) => l !== active) ?? code) : code;
    if (target === active) return;
    const segments = pathname.split("/");
    segments[1] = target;
    const nextPath = segments.join("/") || `/${target}`;
    try {
      globalThis.localStorage.setItem(localeStorageKey, target);
    } catch {
      console.error("Failed to access localStorage");
    }
    router.push(nextPath);
  }

  return (
    <fieldset
      aria-label={t("switch")}
      className="border-border bg-surface/60 relative flex items-center rounded-full border p-0.5 text-xs font-medium"
      style={{ margin: 0, padding: "2px" }}
    >
      {locales.map((code: Locale) => {
        const isActive = active === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5 tracking-wider uppercase transition-colors",
              isActive ? "text-on-accent" : "text-muted hover:text-foreground",
            )}
          >
            {isActive && (
              <m.span
                layoutId="locale-pill"
                className="bg-accent absolute inset-0 -z-10 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
