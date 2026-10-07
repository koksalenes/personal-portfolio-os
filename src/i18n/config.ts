export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeStorageKey = "portfolio-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? "");
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of candidates) {
    const match = locales.find((l) => lang?.toLowerCase().startsWith(l));
    if (match) return match;
  }
  return defaultLocale;
}
